class MyBoard {
    //Todos estes parametros são Components
    constructor(scene, whiteTile, blackTile, whitePiece, blackPiece, divider) {
        this.whiteTile = whiteTile;
        this.blackTile = blackTile;
        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;
        this.divider = divider;
        this.scene = scene;

        this.size = 4; //Size of boards, to get from PROLOG App
        this.spacing = 1; //Spacing between boards
    }

    //Dar display das Tiles e divider em posições corretas 
    //Dar display das pieces em número e posição corretas
    display() {
        //Display 2 boards, a rope and a 2 other boards
        this.drawBoard(this.whiteTile, [0,0]);
        this.drawBoard(this.blackTile, [1,0]);
        this.scene.pushMatrix();
        this.scene.translate(0, this.size + this.spacing/2, 0);
        this.divider.display();
        this.scene.popMatrix();
        this.drawBoard(this.whiteTile, [0,1]);
        this.drawBoard(this.blackTile, [1,1]);

        /* //TODO display pieces in appropriate locations
        this.whitePiece.display();
        this.blackPiece.display();
        */
    }

    drawBoard(tile, boardPos) {
        this.scene.pushMatrix();
        this.scene.translate(boardPos[0] * (this.size + this.spacing), 0, boardPos[1] * (this.size + this.spacing));
        for(let row = 0; row < this.size; row++) {
            for(let col = 0; col < this.size; col++) {
                this.scene.pushMatrix();
                this.scene.translate(row, 0, col); //apply row on x and col on y TODO needs to account for tileSize..
                this.scene.registerForPick(boardPos[1]*32+boardPos[0]*16+row*4+col, tile);
                tile.display();
                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }
}