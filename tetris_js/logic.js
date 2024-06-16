const BOX_SIZE = .85;

class Game {
    constructor(scene, textManager) {
        this.scene = scene;
        this.textManager = textManager;
        this.lastFrameTime = performance.now();
        this.lastShapeUpdate = performance.now();

        // this will hold the current grid of blocks.
        this.grid = [];
        // this will hold the actual cubes corresponding to each position
        this.cubes = [];

        this.loadNewShape();

        // initialize grid & cubes
        for (let i = 0; i < 10; i++) {
            this.grid[i] = [];
            this.cubes[i] = [];
            for (let j = 0; j < 20; j++) {
                this.grid[i][j] = 0; // 0 is empty

                const geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
                const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(i, -j, 0);
                cube.visible = false;

                this.scene.add(cube);
                this.cubes[i][j] = cube;
            }
        }

        // keyboard input
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // make the block fall
    updateShape(translation) {
        //first, check for conflicts
        const size = this.shape.length;
        let success = true;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let actualX = x + this.position.x + translation.x;
                let actualY = y + this.position.y + translation.y;
                if (this.shape[x][y]) {
                    //make sure this shape is falling onto an empty block
                    if (actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20 && this.grid[actualX][actualY] == 0) {
                        this.cubes[actualX][actualY].visible = true;
                    } else {
                        success = false;
                    }
                }
            }
        }

        if (success) {
            this.position.add(translation);
        }
        return success;
    }

    // lock shape in place
    lockShape() {
        const size = this.shape.length;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let actualX = x + this.position.x;
                let actualY = y + this.position.y;
                if (this.shape[x][y]) {
                    // lock in place by adding to this.grid
                    this.grid[actualX][actualY] = this.shapeID;
                }
            }
        }
    }

    // rotate shape
    rotateShape() {
        let success = true;
        const N = this.shape.length;
        const result = Array.from({ length: N }, () => Array(N).fill(0));
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                result[j][N - 1 - i] = this.shape[i][j];
            }
        }

        // now verify result 
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                const actualX = x + this.position.x;
                const actualY = y + this.position.y;
                if (!(actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20 && this.grid[actualX][actualY] == 0)) {
                    success = false;
                }
            }
        }

        if (success)
            return result;
    }

    // should run when the grid is changed
    updateCubes() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 20; y++) {
                if (this.grid[x][y] != 0) {
                    this.cubes[x][y].visible = true;
                    // draw a lighter shade of the actual color (because its locked)
                    const color = lockedColors[this.grid[x][y]];
                    this.setCubeColor(new THREE.Vector2(x, y), color); // locked color
                } else {
                    this.cubes[x][y].visible = false;
                    this.setCubeColor(new THREE.Vector2(x, y), colors[this.shapeID]); // not locked in color
                }
            }
        }
    }

    // changes the color of a cube at given position
    setCubeColor(position, color) {
        const { x, y } = position;
        if (this.cubes[x] && this.cubes[x][y]) {
            this.cubes[x][y].material.color.set(color);
        }
    }

    // loads a new shape
    loadNewShape() {
        // prepare new RANDOM shape
        this.position = new THREE.Vector2(5, 0);
        const keys = Object.keys(shapes);
        const randomIndex = Math.floor(Math.random() * keys.length);
        this.shapeID = keys[randomIndex];
        this.shape = shapes[this.shapeID];
    }

    // runs every frame
    render() {
        // time updates
        const currentFrameTime = performance.now();
        const dt = (currentFrameTime - this.lastFrameTime) / 1000;
        const timeSinceLastShapeUpdate = (currentFrameTime - this.lastShapeUpdate) / 1000;

        if (timeSinceLastShapeUpdate > 1) {
            if (!this.updateShape(new THREE.Vector2(0, 1))) {
                console.log('CANT MOVE DOWN, LETS LOCK THIS BAD BOY IN PLACE!!!!');
                this.lockShape();
                this.loadNewShape();            
            }
            this.lastShapeUpdate = currentFrameTime;
        }


        // first update cubes
        this.updateCubes();
        // update shape
        if (this.shape) {
            const size = this.shape.length;
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    let actualX = x + this.position.x;
                    let actualY = y + this.position.y;
                    if (this.shape[x][y] && actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20) {
                        this.cubes[actualX][actualY].visible = true;
                    }
                }
            }
        }
    }


    // HANDLE KEYBOARD INPUT
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowRight':
                this.updateShape(new THREE.Vector2(1, 0));
                break;
            case 'ArrowLeft':
                this.updateShape(new THREE.Vector2(-1, 0));
                break;
            case 'ArrowDown':
                if (this.updateShape(new THREE.Vector2(0, 1))) {
                    // successfulyl moved down, so reset timer
                    this.lastShapeUpdate = performance.now();
                }
                break;
            case 'ArrowUp':
                // attempt to rotate
                let result = this.rotateShape();
                if (result) {
                    // rotate success, so set new shape
                    this.shape = result;
                }
                break;
        }
    }

}

// shapes dictionary
const shapes = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'L': [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
    ],
    'J': [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
    ],
    'T': [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    'S': [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
    ],
    'Z': [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ]
};
const colors = {
    'I': 0x00ffff,
    'L': 0xff8800,
    'J': 0x0000ff,
    'T': 0xff00ff,
    'S': 0x00ff00,
    'Z': 0xff0000,
    'O': 0xffff00
}
const lockedColors = {
    'I': 0x99ffff,
    'L': 0xffbb99,
    'J': 0x9999ff,
    'T': 0xff99ff,
    'S': 0x99ff99,
    'Z': 0xff9999,
    'O': 0xffff99
}