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
        this.shader.setUniformsValues({ uSampler2: 0 });
        this.textureRTT = textureRTT;
    }
    
    display() {
        this.scene.setActiveShader(this.shader);
        this.scene.pushMatrix();
        this.textureRTT.bind(0);
        this.rectangle.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}

