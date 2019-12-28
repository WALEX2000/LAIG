initialBoard([
                [
                    [ 
                        [b, b, b, b],
                        [e, e, e, e],
                        [e, e, e, e],
                        [w, w, w, w]
                    ],
                    [
                        [b, b, b, b],
                        [e, e, e, e],
                        [e, e, e, e],
                        [w, w, w, w]
                    ]
                ],
                [
                    [
                        [b, b, b, b],
                        [e, e, e, e],
                        [e, e, e, e],
                        [w, w, w, w]
                    ],
                    [
                        [b, b, b, b],
                        [e, e, e, e],
                        [e, e, e, e],
                        [w, w, w, w]
                    ]
                ]
            ]).

intermediateBoard([
                [
                    [ 
                        [e, b, b, b],
                        [e, b, e, e],
                        [e, w, e, e],
                        [w, w, w, e]
                    ],
                    [
                        [b, e, e, b],
                        [e, e, b, b],
                        [e, e, e, e],
                        [w, w, w, e]
                    ]
                ],
                [
                    [
                        [e, b, b, b],
                        [w, e, e, e],
                        [e, e, e, e],
                        [w, w, e, w]
                    ],
                    [
                        [b, b, b, b],
                        [e, e, e, e],
                        [e, w, e, e],
                        [w, e, w, w]
                    ]
                ]
            ]).

endBoard([
                [
                    [ 
                        [e, b, e, b],
                        [e, e, b, b],
                        [e, w, e, e],
                        [w, w, w, e]
                    ],
                    [
                        [b, e, e, b],
                        [e, e, e, b],
                        [e, e, e, e],
                        [e, e, e, b]
                    ]
                ],
                [
                    [
                        [e, w, b, b],
                        [e, e, e, e],
                        [e, e, e, w],
                        [w, e, e, e]
                    ],
                    [
                        [b, b, b, b],
                        [w, e, e, e],
                        [e, w, e, e],
                        [e, e, w, w]
                    ]
                ]
            ]).

%Functions to create a board with variable size

board_size(Board, Size):-
    nth0(0, Board, BoardPair),
    nth0(0, BoardPair, SmallBoard),
    length(SmallBoard, Size).

create_list(0, _, []).
create_list(Size, Char, [Char|Rest]):-
    N is Size - 1,
    create_list(N, Char, Rest).

fill_small_board(B, Size, Size):-
    create_list(Size, 'b', Blist),
    B = [Blist|Rest], N is Size - 1,
    fill_small_board(Rest, Size, N).

fill_small_board([Elem], Size, 1):-
    create_list(Size, 'w', Wlist),
    Elem = Wlist.

fill_small_board([Elem|Rest], Size, N):-
    create_list(Size, 'e', Elist),
    Elem = Elist, N1 is N - 1,
    fill_small_board(Rest, Size, N1).

create_small_board(B, Size):-
    fill_small_board(B, Size, Size).

create_board(Size, Board):-
    create_small_board(B, Size),
    Board = [[B,B],[B,B]].