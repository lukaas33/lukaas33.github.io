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

def bubbleSort(array):
    """ Sorts an array of numbers"""
    working = True

    while working:
        working = False # Only true if is condition inside is true
        for index in range(1, len(array)): # Not including 0
            if array[index - 1] > array[index]: # Last value is higher than current
                swap(index, index - 1, array) # Swap values
                working = True

    return array

def insertSort(array):
    """ Sorts an array of numbers """
    for index in range(1, len(array)): # Not including 0
        value = array[index] # Iteration's value
        current = index
        while current > 0 and value < array[current - 1]: # Index is valid and the iteration's value is smaller than the last
            array[current] = array[current - 1] # Current is the previous value
            current -= 1
        array[current] = value # Insert into last empty space

    return array

def sortDesc(array):
    """ Sorts an array of numbers descending """
    for index in range(1, len(array)): # Not including 0
        value = array[index]
        current = index
        while current > 0 and value > array[current - 1]:
            array[current] = array[current - 1]
            current -= 1
        array[current] = value

    return array

def myQuickSort(array):
    """ Sorts an array of numbers, this is my creation """
    def Check(array):
        """ Checks if the array is sorted """
        result = True # Until proven false
        previous = 0

        for index in range(1, len(array)):
            if array[previous] > array[index]: # Is higher than last one
                result = False
            previous = index

        #print("Sorted", result)

        return result

    def Pivot(part):
        """ Chooses a pivot point """
        start = random.choice(part) # First to check is decided randomly
        pivot = part.index(start)  # Index of first
        return pivot

    def Partition(part):
        """ Partitions and returns a given array """
        previous = 1 # Tracks last checked
        higher = [] # Tracks last that is higher
        lower = None # Tracks last that is lower

        for index in range(1, len(part)): # Skips pivot
            #print(part)
            #print("check", index)
            if part[index] < part[pivot]: # Value is lower than pivot value
                #print(index, "less than", pivot)
                if len(higher) != 0: # If not empty
                    swap(higher[0], index, part) # Swaps with the value higher than the pivot with the lowest index
                    #print("Switching", higher[0], "and", index)
                    lower = higher[0] # Last switched
                    higher.pop(0) # Won't be higher anymore
                    higher.append(index) # New highest
                else:
                    lower = index # Is lower and doesn't have to be switched
                    #print(lower, "no switch")
            else:
                higher.append(index)
                #print(higher, "higher than", pivot)
            previous = index

        if lower != None: # There need to be lower and higher elements
            #print("switch", lower, "and", pivot)
            swap(lower, pivot, part)

        return part

    sorting = True

    while sorting:
        pivot = Pivot(array)
        swap(0, pivot, array) # Needs to be left
        pivot = 0 # New location
        #print("pivot", pivot, "-", array[pivot])
        if len(array[:pivot]) > 1:
            array = Partition(array[:pivot]) # Lower than pivot
        if len(array[pivot:]) > 1:
            array = Partition(array[pivot:]) # Higher than pivot

        if Check(array):
            sorting = False

    return array

def performance(function, data):
    """ Comparing the efficiencies of several sorting algorithms with the same array """
    numbers = list(data)

    timer = Timer(lambda: function(numbers)) # Create a timer object for this action
    durations = timer.repeat(10, 1) # Recording time n times in a row
    duration = sum(durations) / len(durations) # Average time

    return duration
