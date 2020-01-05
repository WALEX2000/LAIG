:-use_module(library(lists)).
:-consult('boards.pl').
:-consult('display.pl').
:-consult('logic.pl').
:-consult('input.pl').

start_game(BoardSize, InitialBoard, _, Message):-
    create_board(BoardSize, InitialBoard),
    Message = "Game reset.".

get_moves_piece(Board, Player, 1, X, Y, Moves,_,Message):-
    valid_moves_by_piece(Board, Player, 1, Y/X, Moves),
    length(Moves, NumMoves),
    atom_concat(NumMoves, " moves found for piece", Message).

get_moves_piece(Board, Player, 2, LastMove, X, Y, Moves,PiecePushed,Message):-
    valid_moves_by_piece(Board, Player, 2, LastMove, Y/X, Moves, PiecePushed),
    length(Moves, NumMoves),
    atom_concat(NumMoves, " moves found for piece", Message).

move_piece(Board, Player, 1, Xi, Yi, Xf, Yf, NewBoard, _, Message):-
    valid_moves_by_piece(Board, Player, 1, Yi/Xi, Moves),
    member([Yf/Xf],Moves),
    move([Yi/Xi, Yf/Xf], Board, NewBoard),
    Message = "Move successful".
move_piece(_, _, _, _, _, _, _, _, _, Message):-
    Message = "Invalid move".

move_piece(Board, Player, 2, Xi, Yi, Xf, Yf, LastMove, NewBoard, PiecePushed, Message):-
    valid_moves_by_piece(Board, Player, 2, LastMove, Yi/Xi, Moves, PiecePushed),
    member([[Yf/Xf],PiecePushed],Moves),
    push_piece(Board, IntermediateBoard, PiecePushed),
    move([Yi/Xi, Yf/Xf], IntermediateBoard, NewBoard),
    Message = "Move successful".
move_piece(_, _, _, _, _, _, _, _, _, _, Message):-
    Message = "Invalid move".

bot_move(Board, Difficulty, PieceType, 1, NewBoard, Move, Message):-
    choose_move(Board, Difficulty, PieceType, 1, Move),
    move(Move,Board,NewBoard),
    Message = "Bot move successful".
bot_move(Board, Difficulty, PieceType, 2, LastMove, NewBoard, [Move,PiecePushed], Message):-
    choose_move(Board, Difficulty, PieceType, 2, LastMove, [Move, PiecePushed]),
    push_piece(Board, IntermediateBoard, PiecePushed),
    move(Move,IntermediateBoard,NewBoard),
    Message = "Bot move successful".