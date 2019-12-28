class MyBoard {
    //Todos estes parametros são Components
    constructor(scene, whiteTile, blackTile, whitePiece, blackPiece, divider) {

        this.whiteTile = whiteTile;
        this.blackTile = blackTile;

        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;

        this.divider = divider;

        this.scene = scene;

        this.initPieces();

        this.size = 4; //Size of boards, to get from PROLOG App
        this.spacing = 2; //Spacing between boards
    }

    initPieces() {
        this.whitePiecePositions = [];
        this.blackPiecePositions = [];
        for(let x = 0; x < 2; x++) {
            for(let y = 0; y < 2; y++) {
                for (let column = 0; column < 4; column++) {
                    this.whitePiecePositions.push([x,y,0,column]);
                    this.blackPiecePositions.push([x,y,3,column]);
                }
            }
        }
    }

    //Dar display das Tiles e divider em posições corretas 
    //Dar display das pieces em número e posição corretas
    display() {
        //Display 2 boards, a rope and a 2 other boards
        this.drawBoard(this.whiteTile, [0,0]);
        this.drawBoard(this.blackTile, [1,0]);
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -this.size-this.spacing/2);
        this.divider.display();
        this.scene.popMatrix();
        this.drawBoard(this.whiteTile, [0,1]);
        this.drawBoard(this.blackTile, [1,1]);

        this.drawPieces(this.whitePiecePositions, this.whitePiece, 0);
        this.drawPieces(this.blackPiecePositions, this.blackPiece, 16);

        //TODO display fallen pieces in appropriate locations
    }

    drawBoard(tile, boardPos) {
        this.scene.pushMatrix();
        this.scene.translate(boardPos[0] * (this.size + this.spacing), 0, boardPos[1] * (this.size + this.spacing));
        for(let row = 0; row < this.size; row++) {
            for(let col = 0; col < this.size; col++) {
                this.scene.pushMatrix();
                this.scene.translate(row-this.size-this.spacing/2, 0, col-this.size-this.spacing/2); //apply row on x and col on y TODO needs to account for tileSize..
                this.scene.registerForPick(420+boardPos[1]*32+boardPos[0]*16+row*4+col, tile);
                tile.display();
                this.scene.clearPickRegistration();
                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }

    drawPieces(positions, piece, offset) {
        for (let i = 0; i < positions.length; i++) {
            this.scene.pushMatrix();
            this.scene.translate(positions[i][0] * (this.size + this.spacing), 0.25, positions[i][1] * (this.size + this.spacing));
            this.scene.translate(positions[i][2]-this.size-this.spacing/2, 0, positions[i][3]-this.size-this.spacing/2);
            this.scene.registerForPick(64+i+offset, piece);
            piece.display();
            this.scene.clearPickRegistration();
            this.scene.popMatrix();
        }
    }
}