:-use_module(library(lists)).
:-consult('boards.pl').
:-consult('display.pl').
:-consult('logic.pl').
:-consult('input.pl').

start_game(InitialBoard, _, Message):-
    create_board(4, InitialBoard),
    Message = "Game reset.".

get_moves_piece(Board, Player, Turn, X, Y, Moves,_,Message):-
    valid_moves_by_piece(Board, Player, Turn, Y/X, Moves),
    %valid_moves(Board, Player, Turn, Moves),
    length(Moves, NumMoves),
    atom_concat(NumMoves, " moves found for piece", Message).
