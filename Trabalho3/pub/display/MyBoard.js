function translateJStoPLboard(JSBoard) {
    return JSON.stringify(JSBoard).replace(/0/g,"e").replace(/1/g,"b").replace(/2/g,"w");
}

function translatePLtoJSboard(PLBoard) {
    return JSON.parse(PLBoard.replace(/e/g,"0").replace(/b/g,"1").replace(/w/g,"2"));
}

class MyBoard {
    //Todos estes parametros são Components
    constructor(scene, whiteTile, blackTile, whitePiece, blackPiece, divider, indicator) {

        this.whiteTile = whiteTile;
        this.blackTile = blackTile;

        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;

        this.divider = divider;
        this.indicator = indicator;

        this.scene = scene;

        this.initPieces();
        this.validMoves = [];

        this.size = 4; //Size of boards, to get from PROLOG App
        this.spacing = 2; //Spacing between boards
    }

    initPieces() {
        this.whitePiecePositions = [];
        this.blackPiecePositions = [];
        for(let x = 0; x < 2; x++) {
            for(let y = 0; y < 2; y++) {
                for (let row = 0; row < 4; row++) {
                    this.blackPiecePositions.push([x,y,row,0]);
                    this.whitePiecePositions.push([x,y,row,3]);
                }
            }
        }
    }

    //Dar display das Tiles e divider em posições corretas 
    //Dar display das pieces em número e posição corretas
    display() {
        //Display 2 boards, a rope and a 2 other boards
        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0.5);
        this.drawBoard(this.whiteTile, [0,0]);
        this.drawBoard(this.blackTile, [1,0]);
        this.scene.pushMatrix();
        this.scene.translate(0,0,-1);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.translate(0, 0, -this.size-this.spacing/2);
        this.divider.display();
        this.scene.popMatrix();
        this.drawBoard(this.whiteTile, [0,1]);
        this.drawBoard(this.blackTile, [1,1]);

        this.drawPieces(this.whitePiecePositions, this.whitePiece, 0);
        this.drawPieces(this.blackPiecePositions, this.blackPiece, 16);
        this.scene.popMatrix();

        this.time = performance.now();

        this.showSuggestions();
        //TODO display fallen pieces in appropriate locations
    }

    drawBoard(tile, boardPos) {
        this.scene.pushMatrix();
        this.scene.translate(boardPos[0] * (this.size + this.spacing), 0, boardPos[1] * (this.size + this.spacing));
        for(let row = 0; row < this.size; row++) {
            for(let col = 0; col < this.size; col++) {
                this.scene.pushMatrix();
                this.scene.translate(row-this.size-this.spacing/2, 0, col-this.size-this.spacing/2); //apply row on x and col on y TODO needs to account for tileSize..
                this.scene.registerForPick(420+boardPos[0]*32+boardPos[1]*16+row*4+col, tile);
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
            this.scene.translate(positions[i][0] * (this.size + this.spacing), 0.40, positions[i][1] * (this.size + this.spacing));
            this.scene.translate(positions[i][2]-this.size-this.spacing/2,0,positions[i][3]-this.size-this.spacing/2);
            this.scene.registerForPick(64+i+offset, piece);
            this.scene.rotate(Math.PI/2, 0, 0, 1);
            piece.display();
            this.scene.clearPickRegistration();
            this.scene.popMatrix();
        }
    }

    checkPicking() {
		if (this.scene.pickMode == false) {
			if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
				for (var i = 0; i < this.scene.pickResults.length; i++) {
                    let obj = this.scene.pickResults[i][0];
                    let customId = this.scene.pickResults[i][1];
                    if(obj==this.blackTile || obj==this.whiteTile) {
                        customId -= 420;
                        let BoardX = Math.floor(customId/32);
                        customId = customId % 32;
                        let BoardY = Math.floor(customId/16);
                        customId = customId % 16;
                        let BoardLine = Math.floor(customId/4);
                        customId = customId % 4;
                        let BoardColumn = customId;
                        console.log("Picked tile: Board ["+BoardX+","+BoardY+"], tile ["+BoardLine+","+BoardColumn+"].");
                    } else if(obj==this.whitePiece) {
                        customId -= 64;
                        console.log("Picked white piece "+customId+".");
                        let position = this.whitePiecePositions[customId];
                        let x = position[0]*4+position[2];
                        let y = position[1]*4+position[3];
                        console.log("Position: x="+x+",y="+y);
                        postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ",w,1," + x + "," + y + "]", this.getPieceMoves.bind(this));
                    } else if(obj==this.blackPiece) {
                        customId -= 80;
                        console.log("Picked black piece "+customId+".");
                        let position = this.blackPiecePositions[customId];
                        let x = position[0]*4+position[2];
                        let y = position[1]*4+position[3];
                        console.log("Position: x="+x+",y="+y);
                        postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ",b,1," + x + "," + y + "]", this.getPieceMoves.bind(this));
                    }
				}
				this.scene.pickResults.splice(0, this.scene.pickResults.length);
			}
		}
	}

    resetGame(reply) {
        let response = JSON.parse(reply.target.response);
        this.board_state = translatePLtoJSboard(response.argA);
        console.log(this.board_state);
    }

    getPieceMoves(reply) {
        let response = JSON.parse(reply.target.response);
        console.log(response);
        this.validMoves = JSON.parse(response.argA.replace(/\//g,','));
        console.log(this.validMoves);
    }

    showSuggestions() {
        for (let i = 0; i < this.validMoves.length; i++) {
            this.scene.pushMatrix();
            this.scene.translate(Math.floor(this.validMoves[i][1]/4) * (this.size + this.spacing), 1, Math.floor(this.validMoves[i][0]/4) * (this.size + this.spacing));
            this.scene.translate(this.validMoves[i][1]%4-this.size-this.spacing/2,0,this.validMoves[i][0]%4-this.size-this.spacing/2);
            this.scene.translate(0.5,0.05*Math.sin(0.005*this.time),0.5);
            this.scene.rotate(0.0005*this.time, 0, 1, 0);
            this.indicator.display();
            this.scene.popMatrix();
        }
    }
}