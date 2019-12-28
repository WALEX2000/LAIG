:-use_module(library(lists)).
:-consult('boards.pl').
:-consult('display.pl').
:-consult('logic.pl').
:-consult('input.pl').

play() :-
    clear_screen,
    repeat,
    write("Enter board size:"),
    get_number_input(BoardSize),
    between(3, 13, BoardSize),!,    
    create_board(BoardSize, Board),
    menu('Play',
        [ 
            playHvsH : 'Human vs Human',
            playHvsM : 'Human vs Machine',
            playMvsM : 'Machine vs Machine',
            quit     : 'Quit'
        ],
        Choice),
    clear_screen,!,
    play(Choice, Board).

play(playHvsH, Board):-
    playHvsH(Board).

play(playHvsM, Board):-
    repeat,
    write("Enter bot difficulty(0/1):"),
    get_number_input(BotDifficulty),
    between(0,1,BotDifficulty),!,
    playHvsM(Board, BotDifficulty).

play(playMvsM, Board):-
    repeat,
    write("Enter bot 1 difficulty(0/1):"),
    get_number_input(Bot1Difficulty),
    between(0,1,Bot1Difficulty),
    repeat,
    write("Enter bot 2 difficulty(0/1):"),
    get_number_input(Bot2Difficulty),
    between(0,1,Bot2Difficulty),!,
    playMvsM(Board, Bot1Difficulty, Bot2Difficulty).

playHvsH(InitBoard) :-
    %%CHECK GAME OVER
    game_over(InitBoard, Winner), print_board(InitBoard, Winner);

    %%GET BOARD SIZE%%
    board_size(InitBoard, BoardSize),

    %%PLAYER 1 FIRST MOVE%%
    display_game(InitBoard, 1, 1),
    valid_moves(InitBoard, b|1, Player1FirstMoves),
    repeat,
    get_player_move(OrigLineP1M1, OrigColP1M1, DestLineP1M1, DestColP1M1, BoardSize, Player1FirstMoves, _),
    move([OrigLineP1M1/OrigColP1M1, DestLineP1M1/DestColP1M1], InitBoard, BoardPostP1First),!,  

    %%PLAYER 1 SECOND MOVE%%
    display_game(BoardPostP1First, 1, 2),
    valid_moves(BoardPostP1First, b|2, [OrigLineP1M1/OrigColP1M1,DestLineP1M1/DestColP1M1], Player1SecondMoves),
    repeat,
    get_player_move(OrigLineP1M2, OrigColP1M2, DestLineP1M2, DestColP1M2, BoardSize, Player1SecondMoves, PiecePushed1),
    push_piece(BoardPostP1First, BoardPostP1Push, PiecePushed1),!,
    move([OrigLineP1M2/OrigColP1M2, DestLineP1M2/DestColP1M2], BoardPostP1Push, BoardPostP1Second),!,

    %%CHECK GAME OVER
    (game_over(BoardPostP1Second, Winner), print_board(BoardPostP1Second, Winner);

    %%PLAYER 2 FIRST MOVE%%
    display_game(BoardPostP1Second, 2, 1),
    valid_moves(BoardPostP1Second, w|1, Player2FirstMoves),
    repeat,
    get_player_move(OrigLineP2M1, OrigColP2M1, DestLineP2M1, DestColP2M1, BoardSize, Player2FirstMoves, _),
    move([OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1], BoardPostP1Second, BoardPostP2First),!,

    %%PLAYER 2 SECOND MOVE%%
    display_game(BoardPostP2First, 2, 2),
    valid_moves(BoardPostP2First, w|2, [OrigLineP2M1/OrigColP2M1,DestLineP2M1/DestColP2M1], Player2SecondMoves),
    repeat,
    get_player_move(OrigLineP2M2, OrigColP2M2, DestLineP2M2, DestColP2M2, BoardSize, Player2SecondMoves, PiecePushed2),
    push_piece(BoardPostP2First, BoardPostP2Push, PiecePushed2),!,
    move([OrigLineP2M2/OrigColP2M2, DestLineP2M2/DestColP2M2], BoardPostP2Push, BoardPostP2Second),!,

    %%NEXT TURN
    playHvsH(BoardPostP2Second)).

playHvsM(InitBoard, DifficultyBot) :-
    %%CHECK GAME OVER%%
    game_over(InitBoard, Winner), print_board(InitBoard, Winner);

    %%GET BOARD SIZE%%
    board_size(InitBoard, BoardSize),

    %%PLAYER 1 FIRST MOVE%%
    display_game(InitBoard, 1, 1),
    valid_moves(InitBoard, b|1, Player1FirstMoves),
    repeat,
    get_player_move(OrigLineP1M1, OrigColP1M1, DestLineP1M1, DestColP1M1, BoardSize, Player1FirstMoves, _),
    move([OrigLineP1M1/OrigColP1M1, DestLineP1M1/DestColP1M1], InitBoard, BoardPostP1First),!,  

    %%PLAYER 1 SECOND MOVE%%
    display_game(BoardPostP1First, 1, 2),
    valid_moves(BoardPostP1First, b|2, [OrigLineP1M1/OrigColP1M1,DestLineP1M1/DestColP1M1], Player1SecondMoves),
    repeat,
    get_player_move(OrigLineP1M2, OrigColP1M2, DestLineP1M2, DestColP1M2, BoardSize, Player1SecondMoves, PiecePushed1),
    push_piece(BoardPostP1First, BoardPostP1Push, PiecePushed1),!,
    move([OrigLineP1M2/OrigColP1M2, DestLineP1M2/DestColP1M2], BoardPostP1Push, BoardPostP1Second),!,

    %%CHECK GAME OVER
    (game_over(BoardPostP1Second, Winner), print_board(BoardPostP1Second, Winner);

    %%PLAYER 2 FIRST MOVE%%
    display_game(BoardPostP1Second, 2, 1),!,
    choose_move(BoardPostP1Second, DifficultyBot, w|1, [OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1]),
    move([OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1], BoardPostP1Second, BoardPostP2First),!,

    %%PLAYER 2 SECOND MOVE%%
    display_game(BoardPostP2First, 2, 2),!,
    choose_move(BoardPostP1Second, DifficultyBot, w|2, [OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1], [[OrigLineP2M2/OrigColP2M2, DestLineP2M2/DestColP2M2],PiecePushed2]),
    push_piece(BoardPostP2First, BoardPostP2Push, PiecePushed2),!,
    move([OrigLineP2M2/OrigColP2M2, DestLineP2M2/DestColP2M2], BoardPostP2Push, BoardPostP2Second),!,

    %%NEXT TURN
    playHvsM(BoardPostP2Second, DifficultyBot)).

playMvsM(InitBoard, DifficultyBot1, DifficultyBot2) :-
    %%CHECK GAME OVER
    game_over(InitBoard, Winner), print_board(InitBoard, Winner);

    %%PLAYER 1 FIRST MOVE%%
    display_game(InitBoard, 1, 1),
    choose_move(InitBoard, DifficultyBot1, b|1, [OrigLineP1M1/OrigColP1M1, DestLineP1M1/DestColP1M1]),
    move([OrigLineP1M1/OrigColP1M1, DestLineP1M1/DestColP1M1], InitBoard, BoardPostP1First),!,  
    sleep(0.1),

    %%PLAYER 1 SECOND MOVE%%
    display_game(BoardPostP1First, 1, 2),
    choose_move(BoardPostP1First, DifficultyBot1, b|2, [OrigLineP1M1/OrigColP1M1, DestLineP1M1/DestColP1M1], [[OrigLineP1M2/OrigColP1M2, DestLineP1M2/DestColP1M2],PiecePushed1]),
    push_piece(BoardPostP1First, BoardPostP1Push, PiecePushed1),!,
    move([OrigLineP1M2/OrigColP1M2, DestLineP1M2/DestColP1M2], BoardPostP1Push, BoardPostP1Second),!,
    sleep(0.1),

    %%CHECK GAME OVER
    (game_over(BoardPostP1Second, Winner), print_board(BoardPostP1Second, Winner);

    %%PLAYER 2 FIRST MOVE%%
    display_game(BoardPostP1Second, 2, 1),!,
    choose_move(BoardPostP1Second, DifficultyBot2, w|1, [OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1]),
    move([OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1], BoardPostP1Second, BoardPostP2First),!,
    sleep(0.1),

    %%PLAYER 2 SECOND MOVE%%
    display_game(BoardPostP2First, 2, 2),!,
    choose_move(BoardPostP1Second, DifficultyBot2, w|2, [OrigLineP2M1/OrigColP2M1, DestLineP2M1/DestColP2M1], [[OrigLineP2M2/OrigColP2M2, DestLineP2M2/DestColP2M2],PiecePushed2]),
    push_piece(BoardPostP2First, BoardPostP2Push, PiecePushed2),!,
    move([OrigLineP2M2/OrigColP2M2, DestLineP2M2/DestColP2M2], BoardPostP2Push, BoardPostP2Second),!,
    sleep(0.1),

    %%NEXT TURN
    playMvsM(BoardPostP2Second, DifficultyBot1, DifficultyBot2)).

