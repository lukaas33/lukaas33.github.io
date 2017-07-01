import browser

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
# Er wordt opgeteld vanaf twee t/m zeven. Getallen die met vermenigvuldigen al voorgekomen zijn worden overgeslagen.
# Elk getal wordt vermenigvuldigd met oplopende getallen tot het maximum is bereikt.
# De getallen die op het einde niet voorgekomen zijn in het vermenigvuldigen zijn priemgetallen.
# Ook de getallen die bij het optellen voorgekomen zijn, zijn priemgetallen
# 3.4
# Voor een getal priemgetallen genereren met het getal zelf als maximum.
# Kijken of het getal in de reeks zit.
# browser.console.log prime number below 10
browser.console.log(Eratosthenes(10))
# 4.2
# Van het laatst gevonden item wordt de index teruggegeven.
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
