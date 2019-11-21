/**
 * MySecurityCamera
 * @constructor
 * @param scene - Reference to MyScene object
 */

class MySecurityCamera extends CGFobject {
	constructor(scene, textureRTT) {
		super(scene);
        this.rectangle = new MyRectangle(this.scene, "securityCamera", 0.5, 1, -1, -0.5);
        this.shader = new CGFshader(this.scene.gl, "shaders/camera.vert", "shaders/camera.frag");
        this.shader.setUniformsValues({ uSampler2: 1 });
        this.textureRTT = textureRTT;
    }
    
    display() {
        this.scene.setActiveShader(this.shader);
        this.textureRTT.bind(1);
        this.rectangle.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}

