/**
 * MyCounter
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCounter extends CGFobject {
	constructor(scene) {
        super(scene);
        this.numberTextures = [
            new CGFtexture(this.scene, 'scenes/images/numbers/number0.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number1.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number2.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number3.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number4.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number5.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number6.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number7.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number8.png'),
            new CGFtexture(this.scene, 'scenes/images/numbers/number9.png')
        ];
        this.square = new MyPlane(this.scene, 'counterDisplay', 4, 4);
        this.displayMaterial = new CGFappearance(this.scene);
        this.displayMaterial.setAmbient(0.7, 0.7, 0.7, 1.0);
        this.displayMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.displayMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.displayMaterial.setShininess(1);
        this.displayMaterial.setEmission(0.0, 0.0, 0.0, 1.0);
	}

    display(whiteScore, blackScore) {
        this.scene.pushMatrix();
        this.displayMaterial.setTexture(this.numberTextures[whiteScore])
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.displayMaterial.apply();
        this.square.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.displayMaterial.apply();
        this.square.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.displayMaterial.setTexture(this.numberTextures[blackScore])
        this.displayMaterial.apply();
        this.square.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.displayMaterial.apply();
        this.square.display();
        this.scene.popMatrix();
    }
}
