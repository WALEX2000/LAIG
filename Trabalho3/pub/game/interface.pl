:-use_module(library(lists)).
:-consult('boards.pl').
:-consult('display.pl').
:-consult('logic.pl').
:-consult('input.pl').

start_game(Difficulty, Type, _, _, Message):-
    nb_setval(difficulty, Difficulty),
    nb_setval(gametype, Type),
    initialBoard(Board),
    nb_setval(board, Board),
    Message = "Game reset.".

get_moves_piece(X,Y,_,_,Message):-
    initialBoard(Board1),
    nb_setval(board, Board1),
    nb_getval(board, Board),
    valid_moves_by_piece(Board, b|1, X/Y, ListOfMoves),
    Message = ListOfMoves.
