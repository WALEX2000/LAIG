:-use_module(library(lists)).
:-use_module(library(ansi_term)).

symbol(w,'⛀').
symbol(b,'⛂').
symbol(e,' ').

clear_screen() :-
    write('\e[H\e[2J').

%print_top_divisor_modules: prints top divisor of a cell on a small board
print_top_divisor_modules(MaxSize, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╗', []).
print_top_divisor_modules(MaxSize, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╗', []).
print_top_divisor_modules(N_module, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╦', []),
    N is N_module + 1,
    print_top_divisor_modules(N,MaxSize, 'white').
print_top_divisor_modules(N_module, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╦', []),
    N is N_module + 1,
    print_top_divisor_modules(N,MaxSize, 'black').

%print_top_divisor: prints top divisor of a small board
print_top_divisor(BoardSize):-
    write('  '),
    ansi_format([bg('black'), fg('white')], '╔', []),
    print_top_divisor_modules(1,BoardSize, 'white'),
    write('     '),
    ansi_format([bg('white'), fg('black')], '╔', []),
    print_top_divisor_modules(1,BoardSize, 'black').

%print_mid_divisor_modules: prints mid divisor of a cell on a small board
print_mid_divisor_modules(MaxSize, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╣', []).
print_mid_divisor_modules(MaxSize, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╣', []).
print_mid_divisor_modules(N_module, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╬', []),
    N is N_module + 1,
    print_mid_divisor_modules(N,MaxSize, 'white').
print_mid_divisor_modules(N_module, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╬', []),
    N is N_module + 1,
    print_mid_divisor_modules(N,MaxSize, 'black').

%print_mid_divisor: prints mid divisor of a small board
print_mid_divisor(BoardSize) :-
    write('  '),
    ansi_format([bg('black'), fg('white')], '╠', []),
    print_mid_divisor_modules(1,BoardSize, 'white'),
    write('     '),
    ansi_format([bg('white'), fg('black')], '╠', []),
    print_mid_divisor_modules(1,BoardSize, 'black').

%print_bot_divisor_modules: prints bot divisor of a cell on a small board
print_bot_divisor_modules(MaxSize, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╝', []).
print_bot_divisor_modules(MaxSize, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╝', []).
print_bot_divisor_modules(N_module, MaxSize, 'white'):-
    ansi_format([bg('black'), fg('white')], '═══╩', []),
    N is N_module + 1,
    print_bot_divisor_modules(N,MaxSize, 'white').
print_bot_divisor_modules(N_module, MaxSize, 'black'):-
    ansi_format([bg('white'), fg('black')], '═══╩', []),
    N is N_module + 1,
    print_bot_divisor_modules(N,MaxSize, 'black').

%print_bot_divisor: prints bot divisor of a small board
print_bot_divisor(BoardSize) :-
    write('  '),
    ansi_format([bg('black'), fg('white')], '╚', []),
    print_bot_divisor_modules(1,BoardSize, 'white'),
    write('     '),
    ansi_format([bg('white'), fg('black')], '╚', []),
    print_bot_divisor_modules(1,BoardSize, 'black').

%print_divisor: prints the divisor between two adjacent vertical cells
print_divisor(BoardSize, BoardSize) :-
    print_bot_divisor(BoardSize).
print_divisor(_, BoardSize) :-
    print_mid_divisor(BoardSize).

%print_cell: prints a cell with the corresponding piece (black, white, empty)
print_cell(Cell, 'white') :-
    symbol(Cell, Char),
    ansi_format([bg('black'), fg('white')], '║ ~w ', [Char]).
print_cell(Cell, 'black') :-
    symbol(Cell, Char),
    ansi_format([bg('white'), fg('black')], '║ ~w ', [Char]).

%print_row: prints a full small board row
print_row([], 'black') :-
    ansi_format([bg('white'), fg('black')], '║', []).
print_row([], 'white') :-
    ansi_format([bg('black'), fg('white')], '║', []).
print_row([Cell|Rest], Color) :-
    print_cell(Cell, Color),
    print_row(Rest, Color).

% L returns the ASCII code for the correct letter
letter(NRow, HalfN, BoardSize, L):-
    L is 65 + NRow + BoardSize*HalfN.

%print_pair_rows: prints two rows side by side of a board pair
print_pair_rows(_, _, BoardSize, BoardSize, _).
print_pair_rows(Board1, Board2, BoardSize, Nrow, HalfN):-
    nth0(Nrow, Board1, Row1), nth0(Nrow, Board2, Row2), %Get rows from both boards
    nl,
    letter(Nrow, HalfN, BoardSize, Letter), char_code(Char, Letter), write(Char), write(' '), 
    print_row(Row1, 'white'),
    write('     '),
    print_row(Row2, 'black'),
    write(' '), write(Char),
    nl,
    Temp is Nrow + 1, print_divisor(Temp, BoardSize),
    NextRow is Nrow + 1,
    print_pair_rows(Board1, Board2, BoardSize, NextRow, HalfN).

%print_board_pair: prints two small boards side by side
print_board_pair(BoardPair, BoardSize, HalfN) :-
    print_top_divisor(BoardSize),
    nth0(0, BoardPair, Board1), nth0(1, BoardPair, Board2), %Get Board1 and Board2 from the pair
    print_pair_rows(Board1, Board2, BoardSize, 0, HalfN). %Print both rows in succession

%print_col_id: print respective column number
print_col_id(BoardSize, BoardSize):-
    write(' '),
    ((BoardSize < 10, write(BoardSize), write('  '));
     (BoardSize > 9, write(BoardSize))).
print_col_id(Id, BoardSize):-
    write(' '),
    ((Id < 10, write(Id), write('  '));
     (Id > 9, write(Id), write(' '))),
    Id1 is Id + 1,
    print_col_id(Id1, BoardSize).

%print_column_ids: print all column numbers on a line
print_column_ids(BoardSize) :-
    write('   '),
    print_col_id(1, BoardSize),
    write('      '), 
    BoardLimit is BoardSize*2,
    ScndHalf is BoardSize+1,
    % print second half now
    print_col_id(ScndHalf, BoardLimit),
    write('\n').


print_rope(BoardSize, BoardSize).
print_rope(Nstrokes, BoardSize):-
    write('-'),
    N is Nstrokes + 1,
    print_rope(N, BoardSize).

print_boards_separator(BoardSize) :-
    nl,
    Nstrokes is (BoardSize+1)*2 + (BoardSize*3*2) + 5 + 2,
    write('\no'), print_rope(0, Nstrokes), write('o\n'),
    nl.

% Dar Print ao Board independentemente do tamanho de cada board
% BP1 é a topHalf e BP2 a bottomHalf do tabuleiro
% É Preciso ir buscar o tamanho de cada tabuleiro invidual a partir disto
% para isso tenho de ir ao primeiro elem de BP1 (Primeiro board) e dps ir ao primeiro elemento desse (primeira linha) e contar no numero de elementos presentes.
print_board([BP1|[BP2|_]]) :-
    nth0(0, BP1, B1), nth0(0, B1, R1), length(R1, BoardSize),
    %Print the board´s column numbers
    print_column_ids(BoardSize),
    % print top half
    print_board_pair(BP1, BoardSize, 0),
    %Print Rope
    print_boards_separator(BoardSize),
    % print bottom half
    print_board_pair(BP2, BoardSize, 1),
    %Print the board´s column numbers again for bottom
    nl, print_column_ids(BoardSize).

print_board(Board, Winner) :-
    clear_screen,
    print_board(Board),
    write("And the winner is: Player "),
    write(Winner),
    write("\n").

% Need to identify which move we are in as well and highlight accordingly
display_game(Board, Player, Move) :-
    write('\e[H\e[2J'),
    write('Player '),
    write(Player),
    write(' playing (Move '),
    write(Move),
    write('):\n'),
    nl,
    print_board(Board).
