from sys import stdout
from copy import deepcopy
from functools import reduce


def printField(field):
    for row in field:
        for cell in row:
            if cell == 0:
                print(' ', end=' ')
            else:
                print(cell, end=' ')
        print(end='\n')


''' Get and proces the input '''
B = int(input())
VA = tuple([int(i) for i in input().split()])
ZA = tuple(list(reversed([int(i) for i in input().split()])))

matrix = [[0 for i in range(B)] for i in range(B)]

''' Initialise fields with minimum and maximum '''
min_field, max_field = deepcopy(matrix), deepcopy(matrix)
for i, row in enumerate(matrix):
    for j, cell in enumerate(row):
        cond = True
        if ZA[i] not in VA:
            cond = False
            if ZA[i] < VA[j]:
                min_field[i][j] = ZA[i]
                max_field[i][j] = ZA[i]
        if VA[j] not in ZA:
            cond = False
            if VA[j] < ZA[i]:
                min_field[i][j] = VA[j]
                max_field[i][j] = VA[j]
        if cond:
            if VA[j] == ZA[i]:
                max_field[i][j] = VA[j]
                min_field[i][j] = VA[j]
            else:
                low = min(VA[j], ZA[i])
                max_field[i][j] = low

# print('m1')
# printField(min_field)

''' Remove doubles from minimum field '''
for i, row in enumerate(min_field):
    for j, cell in enumerate(row):
        if cell != 0:
            opt = None
            found = [[], []]
            for i2, next_row in enumerate(min_field):
                for j2, next_cell in enumerate(next_row):

                    if i == i2 or j == j2:
                        if i2 >= i and j2 >= j and (i2, j2) != (i, j):
                            if cell == next_cell:
                                if i == i2:
                                    found[1].append((i2, j2))
                                else:
                                    found[0].append((i2, j2))

            if found[0] and found[1] or ((cell in ZA) != (cell in VA)):
                # print(found)
                for sub in found:
                    for loc in sub:
                        if loc != opt:
                            min_field[loc[0]][loc[1]] = 0

# print('min')
# printField(min_field)
# print('max')
# printField(max_field)

''' Get values for M and N '''
mini = sum(reduce(lambda x, y: x + y, min_field))
maxi = sum(reduce(lambda x, y: x + y, max_field)) - mini

stdout.write(('%i %i' % (mini, maxi)))
stdout.flush()
