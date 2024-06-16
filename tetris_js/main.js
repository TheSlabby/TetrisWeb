// main.js | Tetris for Web
// Walker McGilvary 6/16/2024

// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, -10, 20);
camera.lookAt(new THREE.Vector3(5, -10, 0));
// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//play sound
let soundPlaying = false;
renderer.domElement.addEventListener('click', () => {
    if (!soundPlaying) {
        soundPlaying = true;
        const sound = new Audio('assets/Tetris.mp3');
        sound.loop = true;
        sound.play();
    }
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Point light with intensity 1 and distance 100
pointLight.position.set(5, 5, 5); // Position the light to illuminate the scene
scene.add(pointLight);

// now initalize tetris game object
const game = new Game(scene);

// Main loop
function animate() {
    requestAnimationFrame(animate);

    game.render();
    renderer.render(scene, camera);
}

animate();