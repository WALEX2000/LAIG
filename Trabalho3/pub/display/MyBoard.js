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
        this.whiteTile.type = "tile";
        this.blackTile.type = "tile";
        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;
        this.divider = divider;
        this.indicator = indicator;

        this.player = 'w';
        this.gamemode = 'PvP';
        this.difficulty = 0;
        this.turn = 1;
        this.phase = "PiecePicking"
        this.boardSize = 4; //Size of boards, to get from PROLOG App
        this.boardSpacing = 2; //Spacing between boards

        this.scene = scene;

        this.whitePieces = [];
        this.blackPieces = [];
        postGameRequest("[start_game]", this.resetGame.bind(this));
        this.validMoves = [];
        this.pileHeight = 0;
    }

    initPieces() {
        this.whitePieces = [];
        this.blackPieces = [];
        for(let x = 0; x < 2; x++) {
            for(let y = 0; y < 2; y++) {
                for (let row = 0; row < 4; row++) {
                    let newBlackPiece = this.blackPiece.clone();
                    newBlackPiece.transformation = mat4.create();
                    mat4.translate(newBlackPiece.transformation, newBlackPiece.transformation, [x * (this.boardSize + this.boardSpacing), 0.40, y * (this.boardSize + this.boardSpacing)]);
                    mat4.translate(newBlackPiece.transformation, newBlackPiece.transformation, [row-this.boardSize-this.boardSpacing/2,0,-this.boardSize-this.boardSpacing/2]);
                    mat4.scale(newBlackPiece.transformation, newBlackPiece.transformation, [0.002, 0.002, 0.002]);
                    mat4.rotateZ(newBlackPiece.transformation, newBlackPiece.transformation, Math.PI/2);
                    newBlackPiece.position = [x*this.boardSize+row,y*this.boardSize];
                    newBlackPiece.type = "blackPiece";
                    this.blackPieces.push(newBlackPiece);
                    
                    let newWhitePiece = this.whitePiece.clone();
                    newWhitePiece.transformation = mat4.create();
                    mat4.translate(newWhitePiece.transformation, newWhitePiece.transformation, [x * (this.boardSize + this.boardSpacing), 0.40, y * (this.boardSize + this.boardSpacing)]);
                    mat4.translate(newWhitePiece.transformation, newWhitePiece.transformation, [row-this.boardSize-this.boardSpacing/2,0,3-this.boardSize-this.boardSpacing/2]);
                    mat4.scale(newWhitePiece.transformation, newWhitePiece.transformation, [0.002, 0.002, 0.002]);
                    mat4.rotateZ(newWhitePiece.transformation, newWhitePiece.transformation, Math.PI/2);
                    newWhitePiece.position = [x*this.boardSize+row,y*this.boardSize+3];
                    newWhitePiece.type = "whitePiece";
                    this.whitePieces.push(newWhitePiece);
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
        this.scene.translate(0, 0, -this.boardSize-this.boardSpacing/2);
        this.divider.display();
        this.scene.popMatrix();
        this.drawBoard(this.whiteTile, [0,1]);
        this.drawBoard(this.blackTile, [1,1]);

        this.drawPieces(this.whitePieces, 0);
        this.drawPieces(this.blackPieces, 16);
        this.scene.popMatrix();

        this.time = performance.now();

        this.showSuggestions();
        //TODO display fallen pieces in appropriate locations
    }

    drawBoard(tile, boardPos) {
        this.scene.pushMatrix();
        this.scene.translate(boardPos[0] * (this.boardSize + this.boardSpacing), 0, boardPos[1] * (this.boardSize + this.boardSpacing));
        for(let row = 0; row < this.boardSize; row++) {
            for(let col = 0; col < this.boardSize; col++) {
                this.scene.pushMatrix();
                this.scene.translate(row-this.boardSize-this.boardSpacing/2, 0, col-this.boardSize-this.boardSpacing/2); //apply row on x and col on y TODO needs to account for tileSize..
                this.scene.registerForPick(420+(boardPos[0]*this.boardSize+row)*8+boardPos[1]*this.boardSize+col, tile);
                tile.display();
                this.scene.clearPickRegistration();
                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }

    drawPieces(pieces, offset) {
        for (let i = 0; i < pieces.length; i++) {
            this.scene.pushMatrix();
            this.scene.registerForPick(64+i+offset, pieces[i]);
            pieces[i].display();
            this.scene.clearPickRegistration();
            this.scene.popMatrix();
        }
    }

    isHumanPlaying() {
        if(this.gamemode == 'PvP')
            return true;
        else if (this.gamemode == 'PvM' && this.player == 'w')
            return true;
        else return false;
    }

    checkPicking() {
		if (this.scene.pickMode == false && this.isHumanPlaying()) {
			if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
				for (var i = 0; i < this.scene.pickResults.length; i++) {
                    let obj = this.scene.pickResults[i][0];
                    let customId = this.scene.pickResults[i][1];
                    if(obj == undefined)
                        continue;
                    switch(this.phase) {
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
                                console.log("Picked tile ["+this.selectedTileX+","+this.selectedTileY+"].");
                                this.phase="PiecePicking";
                                this.validMoves = [];
                            }
                        case "PiecePicking":
                            if(obj.type == "whitePiece" || obj.type == "blackPiece") {
                                customId -= 64;
                                let position;
                                if(obj.type == "blackPiece") {
                                    customId -= 16;
                                    position = this.blackPieces[customId].position;
                                } else position = this.whitePieces[customId].position;
                                this.selectedPieceX = position[0];
                                this.selectedPieceY = position[1];
                                console.log("Position: x="+this.selectedPieceX+",y="+this.selectedPieceY);
                                if(this.turn==1)
                                    postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ","+this.player+",1,"+this.selectedPieceX + "," + this.selectedPieceY + "]", this.getPieceMovesTurn1.bind(this));
                                else
                                    postGameRequest("[get_moves_piece," + translateJStoPLboard(this.board_state) + ","+this.player+",2,["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"],"+this.selectedPieceX + "," + this.selectedPieceY + "]", this.getPieceMovesTurn2.bind(this));
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
        this.initPieces();
    }

    getPieceMovesTurn1(reply) {
        let response = JSON.parse(reply.target.response);
        this.validMoves = JSON.parse(response.argA.replace(/\//g,','));
        if(this.validMoves.length!=0) {
            this.phase="TilePicking";
        }
    }

    getPieceMovesTurn2(reply) {
        let response = JSON.parse(reply.target.response);
        this.validMoves = JSON.parse(response.argA.replace(/\//g,','));
        if(this.validMoves.length!=0)
            this.validMoves = this.validMoves[0];
        if(this.validMoves.length!=0) {
            this.phase="TilePicking";
        }
    }

    showSuggestions() {
        for (let i = 0; i < this.validMoves.length; i++) {
            this.scene.pushMatrix();
            this.scene.translate(Math.floor(this.validMoves[i][1]/this.boardSize) * (this.boardSize + this.boardSpacing), 0.5, Math.floor(this.validMoves[i][0]/this.boardSize) * (this.boardSize + this.boardSpacing));
            this.scene.translate(this.validMoves[i][1]%this.boardSize-this.boardSize-this.boardSpacing/2,0,this.validMoves[i][0]%this.boardSize-this.boardSize-this.boardSpacing/2);
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
            if(response.argB[0] != "_") {
                let piecePushed = JSON.parse(response.argB.replace(/\//g,','));
                let enemyPieces;
                if(this.player == 'w')
                    enemyPieces = this.blackPieces;
                else
                    enemyPieces = this.whitePieces;
                if(piecePushed.length == 4) {
                    for (let i = 0; i < enemyPieces.length; i++) {
                        if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                            enemyPieces[i].position[0] = this.selectedTileX;
                            enemyPieces[i].position[1] = this.selectedTileY;
                            if(enemyPieces[i].animation != null)
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [0, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                            enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[3]-piecePushed[1], piecePushed[0]-piecePushed[2]);
                        }
                    }
                } else {
                    for (let i = 0; i < enemyPieces.length; i++) {
                        if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                            if(enemyPieces[i].animation != null)
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [0, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                            enemyPieces[i].animation = new PieceCaptureAnimation(this.scene, enemyPieces[i].position[0], enemyPieces[i].position[1]);
                            enemyPieces[i].position[0] = -1;
                            enemyPieces[i].position[1] = -1;
                        }
                    }
                }
            }
            let pieces;
            if(this.player == 'w')
                pieces = this.whitePieces;
            else
                pieces = this.blackPieces;
            for (let i = 0; i < pieces.length; i++) {
                if(pieces[i].position[0] == this.selectedPieceX && pieces[i].position[1] == this.selectedPieceY) {
                    pieces[i].position[0] = this.selectedTileX;
                    pieces[i].position[1] = this.selectedTileY;
                    if(pieces[i].animation != null)
                        mat4.translate(pieces[i].transformation, pieces[i].transformation, [0, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                    pieces[i].animation = new PieceMoveAnimation(this.scene, this.selectedTileX-this.selectedPieceX, this.selectedTileY-this.selectedPieceY);
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
                if(!this.isHumanPlaying())
                    postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
            }
            new Audio('sounds/coin.mp3').play();
            console.log("Move successful");
        }
    }

    async botMovePiece(reply) {
        let response = JSON.parse(reply.target.response);
        this.board_state = translatePLtoJSboard(response.argA);
        let move = JSON.parse(response.argB.replace(/\//g,','));

        let pieces;
        let piecePushed;
        if(this.player == 'w')
            pieces = this.whitePieces;
        else
            pieces = this.blackPieces;
        if(Array.isArray(move[0])) {
            piecePushed = move[1];
            move = move[0];
        }

        if(piecePushed != undefined && piecePushed != []) {
            let enemyPieces;
            if(this.player == 'w')
                enemyPieces = this.blackPieces;
            else
                enemyPieces = this.whitePieces;
            if(piecePushed.length == 4) {
                for (let i = 0; i < enemyPieces.length; i++) {
                    if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                        enemyPieces[i].position[0] = piecePushed[3];
                        enemyPieces[i].position[1] = piecePushed[2];
                        if(enemyPieces[i].animation != null)
                            mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [0, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                        enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[3]-piecePushed[1], piecePushed[2]-piecePushed[0]);
                    }
                }
            } else {
                for (let i = 0; i < enemyPieces.length; i++) {
                    if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                        if(enemyPieces[i].animation != null)
                            mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [0, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                        enemyPieces[i].animation = new PieceCaptureAnimation(this.scene, enemyPieces[i].position[0], enemyPieces[i].position[1], this.pileHeight);
                        enemyPieces[i].position[0] = -1;
                        enemyPieces[i].position[1] = -1;
                        this.pileHeight += 0.5;
                    }
                }
            }
        }
        for (let i = 0; i < pieces.length; i++) {
            if(pieces[i].position[0] == move[1] && pieces[i].position[1] == move[0]) {
                pieces[i].position[0] = move[3];
                pieces[i].position[1] = move[2];
                if(pieces[i].animation != null)
                    mat4.translate(pieces[i].transformation, pieces[i].transformation, [0, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                pieces[i].animation = new PieceMoveAnimation(this.scene, move[3]-move[1], move[2]-move[0]);
            }
        }

        //await new Promise(r => setTimeout(r, 500));

        if(this.turn==1) {
            this.turn=2;
            this.lastMoveStartX = move[1];
            this.lastMoveStartY = move[0];
            this.lastMoveEndX = move[3];
            this.lastMoveEndY = move[2];
            postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + ",[" + move[0] + "/" + move[1] + "," + move[2] + "/" + move[3]+"]]", this.botMovePiece.bind(this));
        } else {
            this.turn=1;
            if(this.player=='w')
                this.player='b';
            else this.player='w';
            if(!this.isHumanPlaying())
                postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
        }
    }

    checkDifficultyChange() {
        if(!this.isHumanPlaying()) {
            if(this.turn == 1)
                postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
            else
            postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + ",[" + this.lastMoveStartY + "/" + this.lastMoveStartX + "," + this.lastMoveEndY + "/" + this.lastMoveEndY+"]]", this.botMovePiece.bind(this));
        }
    }
}