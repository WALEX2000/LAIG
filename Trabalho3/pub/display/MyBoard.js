function translateJStoPLboard(JSBoard) {
    return JSON.stringify(JSBoard).replace(/0/g,"e").replace(/1/g,"b").replace(/2/g,"w");
}

function translatePLtoJSboard(PLBoard) {
    return JSON.parse(PLBoard.replace(/e/g,"0").replace(/b/g,"1").replace(/w/g,"2"));
}

class MyBoard {
    //Todos estes parametros são Components
    constructor(scene, whiteTile, blackTile, whitePiece, blackPiece, divider, indicator, table) {
        this.scene = scene;
        this.gameCamera = new CGFcamera(45, 0.1, 1500, vec3.fromValues(0.0,10.0,10.0), vec3.fromValues(0.0,0.0,0.0));
        this.gameCameraActive = false;
        this.gameCameraRotation = 0;
        this.timer = new MyTimer(this.scene, this);
        
        this.whiteTile = whiteTile;
        this.blackTile = blackTile;
        this.whiteTile.type = "tile";
        this.blackTile.type = "tile";
        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;
        this.divider = divider;
        this.indicator = indicator;
        this.table = table;

        this.player = 'w';
        this.gamemode = 'PvP';
        this.difficulty = 0;
        this.turn = 1;
        this.phase = "PiecePicking"
        this.boardSize = 4; //Size of boards, to get from PROLOG App
        this.boardSpacing = 2; //Spacing between boards

        this.whitePieces = [];
        this.blackPieces = [];
        this.validMoves = [];
        this.moves = [];
        this.boards = [];
        this.pileHeight = -2.25;
        this.piecePile = [];
    }

    initPieces() {
        this.whitePieces = [];
        this.blackPieces = [];
        for(let x = 0; x < 2; x++) {
            for(let y = 0; y < 2; y++) {
                for (let row = 0; row < this.boardSize; row++) {
                    let newBlackPiece = this.blackPiece.clone();
                    newBlackPiece.transformation = mat4.create();
                    mat4.translate(newBlackPiece.transformation, newBlackPiece.transformation, [x * (this.boardSize + this.boardSpacing), 0.35, y * (this.boardSize + this.boardSpacing)]);
                    mat4.translate(newBlackPiece.transformation, newBlackPiece.transformation, [row-this.boardSize-this.boardSpacing/2,0,-this.boardSize-this.boardSpacing/2]);
                    mat4.scale(newBlackPiece.transformation, newBlackPiece.transformation, [0.002, 0.002, 0.002]);
                    mat4.rotateZ(newBlackPiece.transformation, newBlackPiece.transformation, Math.PI/2);
                    newBlackPiece.position = [x*this.boardSize+row,y*this.boardSize];
                    newBlackPiece.animation = new PieceFallingAnimation(this.scene);
                    newBlackPiece.type = "blackPiece";
                    this.blackPieces.push(newBlackPiece);
                    
                    let newWhitePiece = this.whitePiece.clone();
                    newWhitePiece.transformation = mat4.create();
                    mat4.translate(newWhitePiece.transformation, newWhitePiece.transformation, [x * (this.boardSize + this.boardSpacing), 0.35, y * (this.boardSize + this.boardSpacing)]);
                    mat4.translate(newWhitePiece.transformation, newWhitePiece.transformation, [row-this.boardSize-this.boardSpacing/2,0,this.boardSize-1-this.boardSize-this.boardSpacing/2]);
                    mat4.scale(newWhitePiece.transformation, newWhitePiece.transformation, [0.002, 0.002, 0.002]);
                    mat4.rotateZ(newWhitePiece.transformation, newWhitePiece.transformation, Math.PI/2);
                    newWhitePiece.position = [x*this.boardSize+row,y*this.boardSize+this.boardSize-1];
                    newWhitePiece.type = "whitePiece";
                    newWhitePiece.animation = new PieceFallingAnimation(this.scene);
                    this.whitePieces.push(newWhitePiece);
                }
            }
        }
    }

    updateBoardSize() {
        this.boardSize = Number(this.boardSize);
        this.moves=[];
        this.boards=[];
        this.whitePieces=[];
        this.blackPieces=[];
        this.timer.stopCount();
        this.player='w';
        this.turn=1;
    }

    //Dar display das Tiles e divider em posições corretas 
    //Dar display das pieces em número e posição corretas
    display() {
        this.rotateGameCamera();

        //Display 2 boards, a rope and a 2 other boards, with a timer, counters and table
        this.scene.pushMatrix();
        this.scene.translate(0,0.75,0);
        this.timer.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0.5);
        this.drawBoard(this.whiteTile, [0,0]);
        this.drawBoard(this.blackTile, [1,0]);
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,-1);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(1,1,this.boardSize*2+this.boardSpacing);
        this.divider.display();
        this.scene.popMatrix();
        this.drawBoard(this.whiteTile, [0,1]);
        this.drawBoard(this.blackTile, [1,1]);

        this.drawPieces(this.whitePieces, 0);
        this.drawPieces(this.blackPieces, this.boardSize*4);
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
        this.scene.scale(this.boardSize/4, 1, this.boardSize/4);
        this.table.display();
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
                this.scene.registerForPick(420+(boardPos[0]*this.boardSize+row)*(this.boardSize*2)+boardPos[1]*this.boardSize+col, tile);
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
                                this.selectedTileX = Math.floor(customId/(this.boardSize*2));
                                customId = customId % (this.boardSize*2);
                                this.selectedTileY = customId;
                                console.log("Picked tile ["+this.selectedTileX+","+this.selectedTileY+"].");
                                if(this.turn==1)
                                    postGameRequest("[move_piece," + translateJStoPLboard(this.board_state) + "," + this.player + "," + this.turn + "," + this.selectedPieceX + "," + this.selectedPieceY + "," + this.selectedTileX + "," + this.selectedTileY + "]", this.movePiece.bind(this));
                                else
                                    postGameRequest("[move_piece," + translateJStoPLboard(this.board_state) + "," + this.player + "," + this.turn + "," + this.selectedPieceX + "," + this.selectedPieceY + "," + this.selectedTileX + "," + this.selectedTileY + ",["+this.lastMoveStartY+"/"+this.lastMoveStartX+","+this.lastMoveEndY+"/"+this.lastMoveEndX+"]]", this.movePiece.bind(this))
                                this.phase="PiecePicking";
                                this.validMoves = [];
                            }
                        case "PiecePicking":
                            if(obj.type == "whitePiece" || obj.type == "blackPiece") {
                                customId -= 64;
                                let position;
                                if(obj.type == "blackPiece") {
                                    customId -= this.boardSize*4;
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
    
    initGame() {
        postGameRequest("[start_game,"+this.boardSize+"]", this.startGame.bind(this));
    }

    startGame(reply) {
        let response = JSON.parse(reply.target.response);
        this.board_state = translatePLtoJSboard(response.argA);
        this.initPieces();
        this.timer.resetCount();
        this.phase = 'TilePicking';
        if(!this.isHumanPlaying()) 
            postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
    }

    resetGame() {
        this.resetGame2();
    }

    async resetGame2() {
        this.validMoves = [];
        if(this.player == 'b') {
            this.gameCameraRotation += Math.PI;
        }
        while(this.moves.length != 0) {
            this.undoMove(false);
            await new Promise(r => setTimeout(r, 200));
        }
        this.timer.resetCount();
    }

    replayGame() {
        this.replayGame2();
    }

    async replayGame2() {
        let moves = [];
        let boards = [];
        let moveNum = this.moves.length;
        for(let i = 0; i < this.moves.length; i++) {
            moves.push(this.moves[i]);
            boards.push(this.boards[i]);
        }
        await this.resetGame2();
        this.phase = "gameOver";
        this.timer.stopCount();
        this.boards=boards;
        this.board_state = this.boards[this.boards.length-1];
        await new Promise(r => setTimeout(r, 250));
        for(let i = 0; i < moves.length; i++) {
            await new Promise(r => setTimeout(r, 250));
            if(this.phase != 'gameOver')
                return;
            let move = moves[i];
            let pieces;
            let piecePushed;
            if(this.player == 'w')
                pieces = this.whitePieces;
            else
                pieces = this.blackPieces;
            if(move.length!=0) {
                if(Array.isArray(move[0])) {
                    piecePushed = move[1];
                    move = move[0];
                    this.moves.push([move,piecePushed])
                } else {
                    this.moves.push(move);
                }
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
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                            enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[3]-piecePushed[1], piecePushed[2]-piecePushed[0]);
                        }
                    }
                } else {
                    for (let i = 0; i < enemyPieces.length; i++) {
                        if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                            if(enemyPieces[i].animation != null)
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                            enemyPieces[i].animation = new PieceCaptureAnimation(this.scene, enemyPieces[i].position[0], enemyPieces[i].position[1], this.pileHeight, this.boardSize, this.boardSpacing);
                            enemyPieces[i].position[0] = -1;
                            enemyPieces[i].position[1] = -1;
                            this.piecePile.push(enemyPieces[i]);
                            this.pileHeight += 0.5;
                        }
                    }
                }
            }
            if(move.length != 0) {
                for (let i = 0; i < pieces.length; i++) {
                    if(pieces[i].position[0] == move[1] && pieces[i].position[1] == move[0]) {
                        pieces[i].position[0] = move[3];
                        pieces[i].position[1] = move[2];
                        if(pieces[i].animation != null)
                            mat4.translate(pieces[i].transformation, pieces[i].transformation, [pieces[i].animation.y, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                        pieces[i].animation = new PieceMoveAnimation(this.scene, move[3]-move[1], move[2]-move[0]);
                    }
                }
            }

            await new Promise(r => setTimeout(r, 500));

            if(this.turn==1) {
                this.turn=2;
            } else {
                this.turn=1;
                this.gameCameraRotation += Math.PI;
                if(this.player=='w')
                    this.player='b';
                else this.player='w';
            }
        }
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
            this.boards.push(this.board_state);
            this.board_state = translatePLtoJSboard(response.argA);
            if(response.argB[0] != "_") {
                let piecePushed = JSON.parse(response.argB.replace(/\//g,','));
                this.moves.push([[this.selectedPieceY,this.selectedPieceX,this.selectedTileY,this.selectedTileX],piecePushed]);
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
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                            enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[3]-piecePushed[1], piecePushed[2]-piecePushed[0]);
                        }
                    }
                } else {
                    for (let i = 0; i < enemyPieces.length; i++) {
                        if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                            if(enemyPieces[i].animation != null)
                                mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                                enemyPieces[i].animation = new PieceCaptureAnimation(this.scene, enemyPieces[i].position[0], enemyPieces[i].position[1], this.pileHeight, this.boardSize, this.boardSpacing);
                                enemyPieces[i].position[0] = -1;
                                enemyPieces[i].position[1] = -1;
                                this.piecePile.push(enemyPieces[i]);
                                this.pileHeight += 0.5;
                        }
                    }
                }
            } else this.moves.push([this.selectedPieceY,this.selectedPieceX,this.selectedTileY,this.selectedTileX]);
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
                        mat4.translate(pieces[i].transformation, pieces[i].transformation, [pieces[i].animation.y, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                    pieces[i].animation = new PieceMoveAnimation(this.scene, this.selectedTileX-this.selectedPieceX, this.selectedTileY-this.selectedPieceY);
                }
            }
            this.checkGameOver();
            if(this.phase == "gameOver")
                return;
            if(this.turn==1) {
                this.turn=2;
                this.lastMoveStartX = this.selectedPieceX;
                this.lastMoveStartY = this.selectedPieceY;
                this.lastMoveEndX = this.selectedTileX;
                this.lastMoveEndY = this.selectedTileY;
            } else {
                this.timer.resetCount();
                this.gameCameraRotation += Math.PI;
                this.turn=1;
                if(this.player=='w')
                    this.player='b';
                else this.player='w';
                if(!this.isHumanPlaying())
                    postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
            }
            console.log("Move successful");
        }
    }

    async botMovePiece(reply) {
        if(this.timer.counting==false || this.phase == 'gameOver')
            return;
        let response = JSON.parse(reply.target.response);
        this.boards.push(this.board_state);
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
            this.moves.push([move,piecePushed])
        } else {
            this.moves.push(move);
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
                            mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                        enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[3]-piecePushed[1], piecePushed[2]-piecePushed[0]);
                    }
                }
            } else {
                for (let i = 0; i < enemyPieces.length; i++) {
                    if(enemyPieces[i].position[0] == piecePushed[1] && enemyPieces[i].position[1] == piecePushed[0]) {
                        if(enemyPieces[i].animation != null)
                            mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                        enemyPieces[i].animation = new PieceCaptureAnimation(this.scene, enemyPieces[i].position[0], enemyPieces[i].position[1], this.pileHeight, this.boardSize, this.boardSpacing);
                        enemyPieces[i].position[0] = -1;
                        enemyPieces[i].position[1] = -1;
                        this.piecePile.push(enemyPieces[i]);
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
                    mat4.translate(pieces[i].transformation, pieces[i].transformation, [pieces[i].animation.y, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                pieces[i].animation = new PieceMoveAnimation(this.scene, move[3]-move[1], move[2]-move[0]);
            }
        }

        await new Promise(r => setTimeout(r, 500));

        if(this.turn==1) {
            this.turn=2;
            this.lastMoveStartX = move[1];
            this.lastMoveStartY = move[0];
            this.lastMoveEndX = move[3];
            this.lastMoveEndY = move[2];
            this.checkGameOver();
            if(this.phase == "gameOver")
                return;
            postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + ",[" + move[0] + "/" + move[1] + "," + move[2] + "/" + move[3]+"]]", this.botMovePiece.bind(this));
        } else {
            this.timer.resetCount();
            this.turn=1;
            this.gameCameraRotation += Math.PI;
            if(this.player=='w')
                this.player='b';
            else this.player='w';
            this.checkGameOver();
            if(this.phase == "gameOver")
                return;
            await new Promise(r => setTimeout(r, 750));
            if(!this.isHumanPlaying())
                postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
        }
        console.log('Bot move successful');
    }

    checkGamemodeChange() {
        if(!this.isHumanPlaying() && this.whitePieces.length != 0) {
            if(this.turn == 1)
                postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
            else
                postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + ",[" + this.lastMoveStartY + "/" + this.lastMoveStartX + "," + this.lastMoveEndY + "/" + this.lastMoveEndY+"]]", this.botMovePiece.bind(this));
        }
    }

    undoMove(rotateCamera) {
        if(rotateCamera)
            this.phase = "TilePicking";
        if(this.moves.length == 0)
            return;

        let move = this.moves.pop();
        if(move==[])
            return;
        this.board_state = this.boards.pop();

        if(this.turn == 2)
            this.turn = 1;
        else {
            if(rotateCamera!=false) {
                this.gameCameraRotation += Math.PI;
            }
            this.turn = 2;
            this.lastMoveStartX = this.moves[this.moves.length-1][1];
            this.lastMoveStartY = this.moves[this.moves.length-1][0];
            this.lastMoveEndX = this.moves[this.moves.length-1][3];
            this.lastMoveEndY = this.moves[this.moves.length-1][2];
            if(this.player=='w')
                this.player='b';
            else
                this.player='w';
        }

        let piecePushed;
        if(Array.isArray(move[0])) {
            piecePushed = move[1];
            move = move[0];
        }
        let pieces;
        if(this.player == 'w')
            pieces = this.whitePieces;
        else
            pieces = this.blackPieces;

        if(piecePushed != undefined && piecePushed.length != 0) {
            let enemyPieces;
            if(this.player == 'w')
                enemyPieces = this.blackPieces;
            else
                enemyPieces = this.whitePieces;
            if(piecePushed.length == 4) {
                for (let i = 0; i < enemyPieces.length; i++) {
                    if(enemyPieces[i].position[0] == piecePushed[3] && enemyPieces[i].position[1] == piecePushed[2]) {
                        enemyPieces[i].position[0] = piecePushed[1];
                        enemyPieces[i].position[1] = piecePushed[0];
                        if(enemyPieces[i].animation != null)
                            mat4.translate(enemyPieces[i].transformation, enemyPieces[i].transformation, [enemyPieces[i].animation.y, -enemyPieces[i].animation.x*500, enemyPieces[i].animation.z*500]);
                        enemyPieces[i].animation = new PieceMoveAnimation(this.scene, piecePushed[1]-piecePushed[3], piecePushed[0]-piecePushed[2]);
                    }
                }
            } else {
                let capturedPiece = this.piecePile.pop();
                this.pileHeight -= 0.5;
                if(capturedPiece.animation != null)
                    mat4.translate(capturedPiece.transformation, capturedPiece.transformation, [capturedPiece.animation.y, -capturedPiece.animation.x*500, capturedPiece.animation.z*500]);
                capturedPiece.position[0] = piecePushed[1];
                capturedPiece.position[1] = piecePushed[0];
                capturedPiece.animation = new PieceUncaptureAnimation(this.scene, capturedPiece.position[0], capturedPiece.position[1], this.pileHeight, this.boardSize, this.boardSpacing);
            }
        }
        for (let i = 0; i < pieces.length; i++) {
            if(pieces[i].position[0] == move[3] && pieces[i].position[1] == move[2]) {
                pieces[i].position[0] = move[1];
                pieces[i].position[1] = move[0];
                if(pieces[i].animation != null)
                    mat4.translate(pieces[i].transformation, pieces[i].transformation, [pieces[i].animation.y, -pieces[i].animation.x*500, pieces[i].animation.z*500]);
                pieces[i].animation = new PieceMoveAnimation(this.scene, -move[3]+move[1], -move[2]+move[0]);
            }
        }
    }

    checkGameOver() {
        let whiteWon = false;
        let blackWon = false;
        for(let pieceOffset = 0; pieceOffset <= 3*this.boardSize; pieceOffset += this.boardSize) {
            for(let i = pieceOffset; i < pieceOffset+this.boardSize; i++) {
                if(this.whitePieces[i].position[0] != -1)
                    break;
                if(i == pieceOffset+this.boardSize-1) {
                    this.timer.stopCount();
                    blackWon = true;
                }
            }
            for(let i = pieceOffset; i < pieceOffset+this.boardSize; i++) {
                if(this.blackPieces[i].position[0] != -1)
                    break;
                if(i == pieceOffset+this.boardSize-1) {
                    this.timer.stopCount();
                    whiteWon = true;
                }
            }
        }
        if(whiteWon) {
            this.phase = "gameOver";
            this.winner = 'w';
        } else if (blackWon) {
            this.phase = "gameOver";
            this.winner = 'b';
        }
    }

    toggleGameCamera() {
        if(this.gameCameraActive) {
            this.scene.camera = this.gameCamera;
            this.scene.interface.setActiveCamera(null);
        } else {
            this.scene.camera = this.scene.cameras[this.scene.selectedViewIndex];
            this.scene.interface.setActiveCamera(this.scene.camera);
        }
    }

    rotateGameCamera() {
        if(this.gameCameraRotation > 0) {
            this.gameCameraRotation -= Math.PI/16;
            this.gameCamera.orbit(CGFcameraAxis.Y, Math.PI/16);
        }
    }

    timeout() {
        console.log("Timed out.");
        this.gameCameraRotation += Math.PI;
        if(this.turn == 1)
            this.moves.push([],[]);
        else
            this.moves.push([]);
        this.turn=1;
        if(this.player=='w')
            this.player='b';
        else this.player='w';
        if(!this.isHumanPlaying())
            postGameRequest("[bot_move," + translateJStoPLboard(this.board_state) + "," + this.difficulty + "," + this.player + "," + this.turn + "]", this.botMovePiece.bind(this));
        this.timer.resetCount();
    }
}