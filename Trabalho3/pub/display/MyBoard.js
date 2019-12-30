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
        this.player = 'w';
        this.turn = 1;
        this.phase = "PiecePicking"

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
                    this.blackPiecePositions.push([x*4+row, y*4]);
                    this.whitePiecePositions.push([x*4+row, y*4+3]);
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
                this.scene.registerForPick(420+(boardPos[0]*4+row)*8+boardPos[1]*4+col, tile);
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
            this.scene.translate(Math.floor(positions[i][0]/4) * (this.size + this.spacing), 0.40, Math.floor(positions[i][1]/4) * (this.size + this.spacing));
            this.scene.translate(positions[i][0]%4-this.size-this.spacing/2,0,positions[i][1]%4-this.size-this.spacing/2);
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
                    switch(this.phase) {
                        case "PiecePicking":
                            if(obj==this.whitePiece || obj == this.blackPiece) {
                                customId -= 64;
                                let position;
                                if(obj == this.blackPiece) {
                                    customId -= 16;
                                    position = this.blackPiecePositions[customId];
                                } else position = this.whitePiecePositions[customId];
                                this.selectedPieceX = position[0];
                                this.selectedPieceY = position[1];
                                console.log("Position: x="+this.selectedPieceX+",y="+this.selectedPieceY);
                                if(this.turn==1)
                                    postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ","+this.player+",1,"+this.selectedPieceX + "," + this.selectedPieceY + "]", this.getPieceMovesTurn1.bind(this));
                                else
                                    postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ","+this.player+",2,["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"],"+this.selectedPieceX + "," + this.selectedPieceY + "]", this.getPieceMovesTurn2.bind(this));
                                console.log("[get_moves_piece," + translateJStoPLboard(this.board_state) + ","+this.player+",2,["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"],"+this.selectedPieceX + "," + this.selectedPieceY + "]");
                            }
                            break;
                        case "TilePicking":
                            if(obj==this.blackTile || obj==this.whiteTile) {
                                customId -= 420;
                                this.selectedTileX = Math.floor(customId/8);
                                customId = customId % 8;
                                this.selectedTileY = customId;
                                if(this.turn==1)
                                    postGameRequest("[move_piece," + translateJStoPLboard(this.board_state) + "," + this.player + "," + this.turn + "," + this.selectedPieceX + "," + this.selectedPieceY + "," + this.selectedTileX + "," + this.selectedTileY + "]", this.movePiece.bind(this));
                                else
                                    postGameRequest("[move_piece," + translateJStoPLboard(this.board_state) + "," + this.player + "," + this.turn + "," + this.selectedPieceX + "," + this.selectedPieceY + "," + this.selectedTileX + "," + this.selectedTileY + ",["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"]]", this.movePiece.bind(this))
                                console.log("[move_piece," + translateJStoPLboard(this.board_state) + "," + this.player + "," + this.turn + "," + this.selectedPieceX + "," + this.selectedPieceY + "," + this.selectedTileX + "," + this.selectedTileY + ",["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"]]");
                                console.log("Picked tile ["+this.selectedTileX+","+this.selectedTileY+"].");
                                this.phase="PiecePicking";
                                this.validMoves = [];
                            }
                            break;
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

    getPieceMovesTurn1(reply) {
        let response = JSON.parse(reply.target.response);
        console.log(response);
        this.validMoves = JSON.parse(response.argA.replace(/\//g,','));
        console.log(this.validMoves);
        if(this.validMoves.length!=0) {
            this.phase="TilePicking";
        }
    }

    getPieceMovesTurn2(reply) {
        let response = JSON.parse(reply.target.response);
        console.log(response);
        console.log(this.validMoves);
        this.validMoves = JSON.parse(response.argA.replace(/\//g,','));
        if(this.validMoves.length!=0)
            this.validMoves = this.validMoves[0];
        console.log(this.validMoves);
        if(this.validMoves.length!=0) {
            this.phase="TilePicking";
        }
    }

    showSuggestions() {
        for (let i = 0; i < this.validMoves.length; i++) {
            this.scene.pushMatrix();
            this.scene.translate(Math.floor(this.validMoves[i][1]/4) * (this.size + this.spacing), 0.5, Math.floor(this.validMoves[i][0]/4) * (this.size + this.spacing));
            this.scene.translate(this.validMoves[i][1]%4-this.size-this.spacing/2,0,this.validMoves[i][0]%4-this.size-this.spacing/2);
            this.scene.translate(0.5,0.05*Math.sin(0.005*this.time),0.5);
            this.scene.rotate(0.0005*this.time, 0, 1, 0);
            this.indicator.display();
            this.scene.popMatrix();
        }
    }

    movePiece(reply) {
        let response = JSON.parse(reply.target.response);
        if(response.message == "Invalid move")
            console.log("Invalid move");
        else {
            this.board_state = translatePLtoJSboard(response.argA);
            let positions;
            if(response.argB[0] != "_") {
                let piecePushed = JSON.parse(response.argB.replace(/\//g,','));
                let enemyPositions;
                if(this.player == 'w')
                    enemyPositions = this.blackPiecePositions;
                else
                    enemyPositions = this.whitePiecePositions
                if(piecePushed.length == 4) {
                    for (let i = 0; i < enemyPositions.length; i++) {
                        if(enemyPositions[i][0] == piecePushed[1] && enemyPositions[i][1] == piecePushed[0]) {
                            enemyPositions[i] = [piecePushed[3], piecePushed[2]];
                        }
                    }
                } else {
                    for (let i = 0; i < enemyPositions.length; i++) {
                        if(enemyPositions[i][0] == piecePushed[1] && enemyPositions[i][1] == piecePushed[0]) {
                            enemyPositions[i] = [-0.2,0];
                        }
                    }
                }
            }
            if(this.player == 'w')
                positions = this.whitePiecePositions;
            else
                positions = this.blackPiecePositions
            for (let i = 0; i < positions.length; i++) {
                if(positions[i][0] == this.selectedPieceX && positions[i][1] == this.selectedPieceY) {
                    positions[i] = [this.selectedTileX, this.selectedTileY];
                }
            }
            if(this.turn==1) {
                this.turn=2;
                this.lastMoveStartX = this.selectedPieceX;
                this.lastMoveStartY = this.selectedPieceY;
                this.lastMoveEndX = this.selectedTileX;
                this.lastMoveEndY = this.selectedTileY;
            } else {
                this.turn=1;
                if(this.player=='w')
                    this.player='b';
                else this.player='w';
            }
            console.log("Move successful");
        }
    }
}