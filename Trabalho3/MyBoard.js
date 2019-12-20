class MyBoard {
    //Todos estes parametros são Components
    constructor(whiteTile, blackTile, whitePiece, blackPiece, divider) {
        this.whiteTile = whiteTile;
        this.blackTile = blackTile;
        this.whitePiece = whitePiece;
        this.blackPiece = blackPiece;
        this.divider = divider;
    }

    //Dar display das Tiles e divier em posições corretas 
    //Dar display das pieces em número e posição corretas
    display() {
        this.whiteTile.display();
        this.blackTile.display();
        this.whitePiece.display();
        this.blackPiece.display();
        this.divider.display();
    }
}