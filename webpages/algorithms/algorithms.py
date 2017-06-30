# Import
import math
import browser

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

# Actions
# 2.1
browser.console.log(Gauss(5))
#  2.2
browser.console.log(Factorial(5))
# 2.3
browser.console.log(Divided(10, 5))
# GCD of 10 and 5
browser.console.log(GCD(10, 5))
# 2.6
browser.console.log(SCM(2, 5))
# 3.1
browser.console.log(IsPrime(5))
# Trial division of 10
browser.console.log(TrialDivision(10))
# browser.console.log 10 Fibonacci numbers
browser.console.log(Fibonacci(10))
# 3.2
browser.console.log(Sequence(10))
# 3.3
"""
Er wordt opgeteld vanaf twee t/m zeven. Getallen die met vermenigvuldigen al voorgekomen zijn worden overgeslagen.
Elk getal wordt vermenigvuldigd met oplopende getallen tot het maximum is bereikt.
De getallen die op het einde niet voorgekomen zijn in het vermenigvuldigen zijn priemgetallen.
Ook de getallen die bij het optellen voorgekomen zijn, zijn priemgetallen
"""
# 3.4
"""
Voor een getal priemgetallen genereren met het getal zelf als maximum.
Kijken of het getal in de reeks zit.
"""
# browser.console.log prime number below 10
browser.console.log(Eratosthenes(10))
# 4.2
"""
Van het laatst gevonden item wordt de index teruggegeven.
"""
# 4.3: Testing of the search function
browser.console.log(LinearSearch('A', ['D', 'T', 'E']))
browser.console.log(LinearSearch('O', ['O', 'A', 'C']))
browser.console.log(LinearSearch('B', ['B', 'B', 'A']))
# Testing my new algorithm and the old one
browser.console.log(BinarySearch(11, Eratosthenes(110)))
browser.console.log(LinearSearch(11, Eratosthenes(110)))
# 5.1: Swapping indexes
autos = ["Ford", "Audi", "Saab", "Opel"]
Swap(0, 1, autos)
Swap(2, 3, autos)
browser.console.log(autos)
