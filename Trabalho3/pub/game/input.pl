read_cell(Line, Col, BoardSize):-
    RealSize is BoardSize*2,
    read_line_to_codes(user_input, Codes),
    string_codes(String, Codes),
    atom_chars(String, [LineChar|ColChars]),
    char_code(LineChar, LineNum),
    Line is LineNum-65,
    Line@>=0,
    Line@<RealSize,
    number_string(ColNum, ColChars),
    Col is ColNum - 1,
    Col@>=0,
    Col@<RealSize.

get_player_move(OrigLine, OrigCol, DestLine, DestCol, BoardSize, PlayerMoves, PiecePushed):-
    write("Origin (eg: A1):"),
    read_cell(OrigLine, OrigCol, BoardSize),
    write("Destination (eg: A1):"),
    read_cell(DestLine, DestCol, BoardSize),
    (member([OrigLine/OrigCol,DestLine/DestCol], PlayerMoves);
    member([[OrigLine/OrigCol,DestLine/DestCol], PiecePushed], PlayerMoves)).
get_player_move(_, _, _, _, _, _, _):-
    write("Invalid move.\n"),
    fail.

get_number_input(Number):-
    read_line_to_codes(user_input, Codes),
    string_codes(String, Codes),
    atom_chars(String, Chars),
    number_string(Number, Chars).
get_number_input(_):-
    write("Invalid input.\n"),
    fail.