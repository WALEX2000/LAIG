/**
 * MyTimer
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTimer extends CGFobject {
	constructor(scene, board) {
        super(scene);
        this.board = board;
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

        this.whiteTex = new CGFtexture(this.scene, 'scenes/images/white_tile.jpg');
        this.blackTex = new CGFtexture(this.scene, 'scenes/images/black_tile.jpg');

        this.square = new MyPlane(this.scene, 'timerDisplay', 4, 4);
        this.cylinder = new MyCylinder(this.scene, 'timerBorder', 0.1, 0.1, 1, 12, 4);
        this.cube = new MyUnitCubeQuad(this.scene, this.blackTex);

        this.displayMaterial = new CGFappearance(this.scene);
        this.displayMaterial.setAmbient(0.7, 0.7, 0.7, 1.0);
        this.displayMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.displayMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.displayMaterial.setShininess(1);
        this.displayMaterial.setEmission(0.0, 0.0, 0.0, 1.0);

        this.countStart = 0;
        this.counting = false;
        this.maxTime = 30;
	}

    display() {
        this.update();

        this.displayMaterial.setTexture(this.blackTex);
        this.displayMaterial.apply();

        this.scene.pushMatrix();
        this.scene.translate(-1.1, 0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(1.1, 0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,0.6,0);
        this.scene.scale(2.5, 0.2, 0.2);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        if(this.counting)
            this.displayMaterial.setTexture(this.numberTextures[Math.floor(this.time/10)])
        else
            this.displayMaterial.setTexture(this.numberTextures[0]);
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
        if(this.counting)
            this.displayMaterial.setTexture(this.numberTextures[this.time%10])
        else
            this.displayMaterial.setTexture(this.numberTextures[0]);
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

    update() {
        if(this.counting) {
            this.time = this.maxTime - Math.floor((performance.now() - this.countStart)/1000);
            if(this.time <= 0) {
                this.counting = false;
                this.board.timeout();
            }
        }
    }

    resetCount() {
        this.countStart = performance.now();
        this.counting = true;
    }

    stopCount() {
        this.counting = false;
    }
}
