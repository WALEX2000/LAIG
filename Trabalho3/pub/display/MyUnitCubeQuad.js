/**
 * MyUnitCubeQuad
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyUnitCubeQuad extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.quadPol = new MyQuad(scene);

        this.cubeMat = new CGFappearance(this.scene);
        this.cubeMat.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.cubeMat.setDiffuse(1, 1, 1, 1.0);
        this.cubeMat.setSpecular(0.7, 0.7, 0.7, 1.0);
        this.cubeMat.setShininess(10.0);

        this.texture = texture;
        this.cubeMat.setTexture(this.texture);
    }
    updateBuffers() {

    }
    display() {
        this.cubeMat.apply();
        //FRONT
        this.scene.pushMatrix();
        this.scene.translate(0,0,0.5);
        this.quadPol.display();
        this.scene.popMatrix();

        //BACK
        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.5);
        this.scene.scale(-1,1,1);
        this.quadPol.display();
        this.scene.popMatrix();

        //RIGHT
        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2, 0,1,0);

        this.quadPol.display();
        this.scene.popMatrix();

        //LEFT
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2, 0,1,0);
        this.quadPol.display();
        this.scene.popMatrix();

        //TOP
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0);
        this.scene.rotate(-Math.PI/2, 1,0,0);
        this.quadPol.display();
        this.scene.popMatrix();

        //BOTTOM
        this.scene.pushMatrix();
        this.scene.translate(0,-0.5,0);
        this.scene.rotate(Math.PI/2, 1,0,0);
        this.quadPol.display();
        this.scene.popMatrix();
    }
}

