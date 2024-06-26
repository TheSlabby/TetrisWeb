const BOX_SIZE = .85;
const INITIAL_DROP_SPEED = 1;
const DROP_SPEED_ACCELERATE = .006; // should leave .1 second speed after 150 lines

class Game {
    constructor(scene, textManager) {
        this.scene = scene;
        this.textManager = textManager;
        this.lastFrameTime = performance.now();
        this.lastShapeUpdate = performance.now();
        this.speed = INITIAL_DROP_SPEED;

        // game vars
        this.linesCleared = 0;
        this.score = 0;
        this.gameStartTime = performance.now();

        // initialize sounds
        this.singleClearSound = new Audio('assets/tetris line clear.mp3');
        this.fullClearSound = new Audio('assets/tetris full clear.mp3');
        this.dropSound = new Audio('assets/tetris drop sound.mp3');

        // this will hold the current grid of blocks.
        this.grid = [];
        // this will hold the actual cubes corresponding to each position
        this.cubes = [];

        // initialization functions
        this.updateText();

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

        // load shape after grid initialized
        this.loadNewShape();

        // keyboard input
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // make the block fall
    updateShape(translation, draw=true) {
        //first, check for conflicts
        const size = this.shape.length;
        let success = true;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let actualX = x + this.position.x + translation.x;
                let actualY = y + this.position.y + translation.y;
                if (this.shape[x][y]) {
                    //make sure this shape is falling onto an empty block
                    if (actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20 && this.grid[actualX][actualY] <= 0) {
                        // set this cube to visible (if draw = true)
                        if (draw)
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

        // finished locking shape
        let lastClears = this.linesCleared;
        this.checkForClears();
        let totalClears = this.linesCleared - lastClears;

        if (totalClears > 0) {
            this.updateText();
            if (totalClears < 4) {
                this.singleClearSound.play();
            } else {
                this.fullClearSound.play();
            }
        } else {
            this.dropSound.play();
        }

        this.loadNewShape();  
    }

    // create drop preview (where the shape will land)
    dropPreview() {
        let lastPosition = this.position.clone();

        // drop until it cant drop anymore
        while (true) {
            if (!this.updateShape(new THREE.Vector2(0, 1), false)) {
                break;
            }
        }

        // // now reset the last drop preview
        // for (let x = 0; x < 10; x++) {
        //     for (let y = 0; y < 20; y++) {
        //         if (this.grid[x][y] == -1)
        //             this.grid[x][y] = 0;
        //     }
        // }

        // now draw preview in grid
        const size = this.shape.length;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let actualX = x + this.position.x;
                let actualY = y + this.position.y;
                if (this.shape[x][y]) {
                    this.setCubeColor(new THREE.Vector2(actualX, actualY), colors['PREVIEW']); // locked color
                    this.cubes[actualX][actualY].visible = true;
                    // lock in place by adding to this.grid
                }
            }
        }

        // now reset position
        this.position = lastPosition;
    }

    // check for clears
    checkForClears() {
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.grid[x][y] <= 0)
                    break;

                // check if the whole row has been iterated
                if (x == 9) {
                    console.log("Clearing row: " + y);
                    for (let i = 0; i < 10; i++) {
                        this.grid[i][y] = 0;

                        //now move all rows above this one down
                        for (let j = y; j > 0; j--) {
                            if (j > 0) {
                                //set this cell to the cell above
                                this.grid[i][j] = this.grid[i][j-1];
                            } else {
                                //because its the top row, just clear it (j-1 = -1)
                                this.grid[i][j] = 0;
                            }
                        }

                    }

                    // done clearing row, update text
                    this.linesCleared += 1;
                    this.speed -= DROP_SPEED_ACCELERATE;
                }
            }
        }
    }

    // update textmanager text
    updateText() {
        this.textManager.loadText('Lines Cleared: ' + this.linesCleared);
    }

    // rotate shape
    rotateShapeCCW(force = false) {
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
                if (!(actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20 && this.grid[actualX][actualY] <= 0)) {
                    success = false;
                }
            }
        }

        if (force || success)
            return result;
    }
    
    // just rotate CCW three times to rotate CW 1 time
    rotateShapeCW() {
        let initialShape = this.shape.map(row => row.slice()); // copy this.shape

        this.shape = this.rotateShapeCCW(true);
        this.shape = this.rotateShapeCCW(true);
        let result = this.rotateShapeCCW();
        if (result) {
            this.shape = result;
        } else {
            this.shape = initialShape;
        }
    }

    // should run when the grid is changed
    updateCubes() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 20; y++) {
                if (this.grid[x][y] != 0) {
                    this.cubes[x][y].visible = true;
                    const color = lockedColors[this.grid[x][y]];
                    this.setCubeColor(new THREE.Vector2(x, y), color); // locked color
                } else {
                    this.cubes[x][y].visible = false;
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

        // check for conflicts
        if (!this.updateShape(new THREE.Vector2())) {
            // conflict, so run game over sequence
            this.endGame();
        }
    }

    // game over sequence
    endGame() {
        // set game over text
        this.textManager.loadText('GAME OVER!\nYou cleared ' + this.linesCleared + ' lines.')

        // TODO make score system
        this.score = this.linesCleared;

        // show modal to save score
        const modal = document.getElementById('leaderboard-modal');
        const doc = document.documentElement;
        doc.classList.add('modal-is-open', 'modal-is-opening')
        modal.setAttribute('open', 'open');
        document.getElementById('modal-message').innerHTML = 'You made it to the leaderboard with a score of: ' + this.score;
        // now set modal properties
        document.getElementById('score').value = this.score;
        document.getElementById('lines_cleared').value = this.linesCleared;
        document.getElementById('game_duration').value = Math.round((performance.now() - this.gameStartTime) / 1000);

        // now reset everything
        this.linesCleared = 0;
        this.speed = INITIAL_DROP_SPEED;
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 20; y++) {
                this.grid[x][y] = 0;
            }
        }
        this.loadNewShape();
    }

    // runs every frame
    render() {
        // time updates
        const currentFrameTime = performance.now();
        const dt = (currentFrameTime - this.lastFrameTime) / 1000;
        const timeSinceLastShapeUpdate = (currentFrameTime - this.lastShapeUpdate) / 1000;

        if (timeSinceLastShapeUpdate > this.speed) {
            if (!this.updateShape(new THREE.Vector2(0, 1))) {
                console.log('CANT MOVE DOWN, LETS LOCK THIS BAD BOY IN PLACE!!!!');
                this.lockShape();            }
            this.lastShapeUpdate = currentFrameTime;
        }



        // first update cubes
        this.updateCubes();
        
        // finally draw drop preview
        this.dropPreview();

        // update shape
        if (this.shape) {
            const size = this.shape.length;
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    let actualX = x + this.position.x;
                    let actualY = y + this.position.y;
                    if (this.shape[x][y] && actualX >= 0 && actualX < 10 && actualY >= 0 && actualY < 20) {
                        this.cubes[actualX][actualY].visible = true;
                        this.setCubeColor(new THREE.Vector2(actualX, actualY), colors[this.shapeID]);
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
                    this.lastShapeUpdate = performance.now() - (this.speed/1.3 * 1000);
                }
                break;
            case ' ':
                // attempt to rotate
                let result = this.rotateShapeCW();
                if (result) {
                    // rotate success, so set new shape
                    this.shape = result;
                }
                break;
            case 'ArrowUp':
                // force drop
                while (true) {
                    if (!this.updateShape(new THREE.Vector2(0, 1))) {
                        this.lockShape();
                        break;
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
    'O': 0xffff00,
    'PREVIEW': 0x777777,
}
const lockedColors = {
    'I': 0x99ffff,
    'L': 0xffbb99,
    'J': 0x9999ff,
    'T': 0xff99ff,
    'S': 0x99ff99,
    'Z': 0xff9999,
    'O': 0xffff99,
}