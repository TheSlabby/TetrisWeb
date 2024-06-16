const BOX_SIZE = .8;

class Game {
    constructor(scene) {
        this.scene = scene;
        this.lastFrameTime = performance.now();
        this.lastShapeUpdate = performance.now();

        // this will hold the current grid of blocks.
        this.grid = [];
        // this will hold the actual cubes corresponding to each position
        this.cubes = [];

        // falling block properties
        this.shape = shapes['I']; // INITIAL FALLING BLOCK SHAPE
        this.position = new THREE.Vector2();
        this.rotation = null;

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
    }

    // make the block fall
    updateShape() {
        this.position.y += 1;
    }

    // should run when the grid is changed
    updateCubes() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 20; y++) {
                if (this.grid[x][y] != 0) {
                    console.log('showing cube!');
                    this.cubes[x][y].visible = true;
                } else {
                    this.cubes[x][y].visible = false;
                }
            }
        }
    }

    // runs every frame
    render() {
        // time updates
        const currentFrameTime = performance.now();
        const dt = (currentFrameTime - this.lastFrameTime) / 1000;
        const timeSinceLastShapeUpdate = (currentFrameTime - this.lastShapeUpdate) / 1000;

        if (timeSinceLastShapeUpdate > 1) {
            this.updateShape();
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