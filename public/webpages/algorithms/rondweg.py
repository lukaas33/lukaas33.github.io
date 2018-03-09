import copy


def printField(field):
    ''' Displays the field in a readable way '''
    print(end='\n')
    for row in field:
        for cell in row:
            print(cell, end=' ')
        print(end='\n')


def genField(plots):
    ''' Generates the full field '''
    field = [['[ ]' for b in range(24)] for a in range(25)]

    for rnum, row in enumerate(field):
        for cnum, cell in enumerate(row):
            for plot in plots:
                if plot == (rnum + 1, cnum + 1):
                    field[rnum][cnum] = '[X]'

    return field


def generateSquares(r, c):
    ''' Generate possible squares  '''
    possible = []
    for r1 in range(r):
        r1 += 1
        for r2 in range(r1, r):
            r2 += 1
            for c1 in range(c):
                c1 += 1
                for c2 in range(c1, c):
                    c2 += 1
                    possible.append((r1, r2, c1, c2))

    return possible


def checkSquare(r1, r3, c1, c2):
    ''' Checks if the square is valid '''
    if c1 < c2 and r1 < r3:
        square = ((r1, c1), (r1, c2), (r3, c1), (r3, c2))
        return square
    else:
        return None


def solve(squares, plots, oriField):
    ''' Will solve what is the optimal road '''
    solutions = []
    for square in squares:
        field = copy.deepcopy(oriField)
        legal = True
        road_locs = []

        for rnum, row in enumerate(field):
            if not legal:
                break
            rnum += 1
            for cnum, cell in enumerate(row):
                if not legal:
                    break
                cnum += 1
                coord = (rnum, cnum)
                if square[0][0] <= rnum <= square[2][0] and cnum in(square[0][1], square[1][1]) or \
                square[0][1] <= cnum <= square[1][1] and rnum in (square[0][0], square[2][0]):
                    for plot in plots:
                        if plot == coord:
                            legal = legal
                            legal = False
                            # print('Illegal at', coord)
                            break
                    if coord not in road_locs:
                        # print('Road at', coord, road_locs)
                        field[rnum - 1][cnum - 1] = '[=]'
                        road_locs.append(coord)

        if legal:
            result = 0
            for target in plots:
                distances = []
                for loc in road_locs:
                    r_dis = abs(target[0] - loc[0])
                    c_dis = abs(target[1] - loc[1])
                    distances.append(r_dis + c_dis)
                result += min(distances)
                # print('From', target, 'it is', min(distances))

            # printField(field)
            # print(result)
            solutions.append({'map': field, 'distance': result})

    return solutions


''' Actions '''
gplots = [
    (2, 6),
    (1, 13),
    (1, 21),
    (3, 21),
    (4, 14),
    (5, 23),
    (5, 18),
    (6, 5),
    (8, 14),
    (9, 9),
    (12, 9),
    (11, 3),
    (15, 24),
    (16, 14),
    (16, 5),
    (19, 21),
    (21, 1),
    (20, 5),
    (22, 9),
    (23, 17)
]

gfield = genField(gplots)  # Field with all variables

gsquares = []
squareVals = generateSquares(25, 24)  # All squares in range

for values in squareVals: # Check them
    sqr = checkSquare(*values)
    if sqr is not None:
        gsquares.append(sqr)

gsolves = solve(gsquares, gplots, gfield)  # Solve for the best road

if gsolves:
    mini = min([x['distance'] for x in gsolves])  # The minimal
    for solve in gsolves:
        if solve['distance'] == mini:
            printField(solve['map'])
            print(solve['distance'])
