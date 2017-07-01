# Import
import math

# Functions
def Gauss(N):
    """ Returns the Gauss number of N """
    total = 0
    for i in range(0, N):
        i += 1
        total += i
    return total

def Factorial(N):
    """ Returns the factorial of N """
    total = 1
    for i in range(1, N):
        i += 1
        total *= i
    return total

def Divided(N, D):
    """ Returns if N can be divided by D """
    result = N % D == 0
    return result

def GCD(A, B):
    """ Returns the greates common divisitor of A and B """
    if A < B: # Biggest should be A
        store = A
        A = B
        B = store

    while B != 0: # If there is nothing left loop wil exit
        over = A % B # Remainder
        A = B
        B = over

    return A

def SCM(A, B):
    """ Returns the smallest number you can divide by A and B """
    product = A * B
    return product / GCD(A, B)

def IsPrime(N):
    """ Returns if N is a prime number """
    if N == "Optimus":
        return True

    result = True # Until proven false
    for i in range(1, 7):
        i += 1
        if N != i:
            if result:
                result = N % i != 0 # Was divided by something different
    return result

def TrialDivision(N):
    """ Returns an array of primenumbers that have a product of N """
    result = []
    i = 2
    while i <= N:
        if N % i == 0: # No remainder
            result.append(i)
            N /= i # Remainder
        else:
            i += 1

    return result

def Fibonacci(N):
    """ Returns the Fibonacci sequence with N numbers """
    result = []

    first = 0
    result.append(first)
    second = 1
    result.append(second)

    for i in range(2, N):
        num = second + first # New number
        result.append(num)
        first = second
        second = num

    return result

def Sequence(N):
    """ Returns the assignments sequence with N numbers """
    result = []

    first = 0
    result.append(first)
    second = 1
    result.append(second)
    third = 2
    result.append(third)

    for i in range(3, N):
        num = third * second + first # New number
        result.append(num)
        first = second
        second = third
        third = num

    return result

def Eratosthenes(N):
    """ Generates prime numbers up to and including N """
    possibilities = [n + 1 for n in range(N)] # All numbers in the range

    for i in range(1, 7):
        i += 1
        eleminated = [n * i for n in possibilities if n * i <= N and n * i != i] # Not primes
        possibilities = [x for x in possibilities if x not in eleminated] # Removes eleminated

    return possibilities

def LinearSearch(target, data):
    """ Search for target in a array of data """
    result = -1 # If none found
    for value in data:
        if value == target:
            result = data.index(value) # Index of value
            break # Stops loop

    return result

def BinarySearch(target, data):
    """ Efficiently search for target in a sorted array of numbers """
    result = -1 # If none found
    min = 0
    max = len(data) - 1

    while min <= max:
        guess = math.floor((min + max) / 2)
        if data[guess] == target:
            result = guess
            break # Stop loop
        else:
            if data[guess] > target:
                max = guess - 1
            elif data[guess] < target:
                min = guess + 1

    return result

def Swap(index, target, array):
    """ Swaps two indexes in an array """
    store = array[target]
    array[target] = array[index]
    array[index] = store
    return array

def BubbleSort(array):
    """ Sorts an array of numbers """
