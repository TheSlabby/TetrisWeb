class TextManager {
    constructor(scene) {
        // Load the font and create the text
        this.loader = new THREE.FontLoader();
        this.scene = scene;
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    }

    loadText(string) {
        //first delete old text, if it exists
        if (this.textMesh) {
            this.scene.remove(this.textMesh);
            this.textMesh = null;
        }

        this.loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const geometry = new THREE.TextGeometry(string, {
                font: font,
                size: .8,
                height: .1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });

            this.textMesh = new THREE.Mesh(geometry, this.material);

            this.scene.add(this.textMesh);

            // Center the text
            // geometry.computeBoundingBox();
            // const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            this.textMesh.position.x = -3;
            this.textMesh.position.y = 1.5;
            this.textMesh.position.z = 0;
        });
    }
}