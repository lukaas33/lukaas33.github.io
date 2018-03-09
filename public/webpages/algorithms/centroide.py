from sys import stdout

''' Get input '''
N = int(input())
points = [[int(j) for j in input().split(' ')] for i in range(N - 1)]

''' Set variables '''
# Occurance in lines
occurs = [sum([i.count(j + 1) for i in points]) for j in range(N)]
result = []


def weights(point, tree, visited):
    ''' Gets the weight of a point '''
    visited.append(point)  # Tracks visited nodes
    # print('went to', visited)
    # print('total', result)
    connections = []
    for branch in tree:  # Check all
        if point in branch:
            # The connected node
            connected = [i for i in branch if i != point][0]
            # print(point, 'connected to', connected)
            if connected not in visited:
                connections.append(connected)  # Store the node
    # print(connections)

    branches = []
    for connected in connections:  # All connected nodes
        # print(connected, 'occurs', occurs[connected - 1])
        if occurs[connected - 1] == 1:  # End node
            branches.append(1)  # One branch
        else:
            # Branches connected to this one
            subbranches = weights(connected, tree, visited)  # Recursion
            subbranches.append(1)  # The current
            branches.append(sum(subbranches))
    return branches


''' Loop through tree '''
total = []
for index in range(N):
    index += 1
    visited = list()
    total.append([index, weights(index, points, visited)])

''' Get the lowest of all weights '''
high_weight = [max(i for i in j[1]) for j in total]  # The highest weight
lowest_highest = min(high_weight)  # The lowest of all the highest
# print(high_weight, 'lowest is', lowest_highest)

for weight in total:  # All the points
    maxi = max(i for i in weight[1])
    if maxi == lowest_highest:  # Weight is equal to the lowest
        result.append(weight[0])
# print(result)

stdout.write(' '.join([str(i) for i in sorted(result)]))
stdout.flush()
