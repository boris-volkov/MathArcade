# CALCULATOR QUEST (BASIC) by BORIS VOLKOV
# the main function is challenge()
# call it with a time limit in seconds, for example: challenge(300)
# call it with an optional second parameter for starting level
# ex: challenge(300,100) to play for 5 minutes, starting at level 100

import time
import random
import math

level = 5

def score(x):
    L = 3
    m = 3.8
    k = 1
    v = 0.3
    score = L/(1+math.exp(k*(x-m-math.log(level,10)))) + v
    return score

def make_string(opflag, upper, lower, answer): 
    margin = '       '
    uLen = len(str(upper))
    lLen = len(str(lower))
    aLen = len(str(answer))
    digits = max(uLen, lLen, aLen-2)
    return( '\n'*2 + margin + ' '*2  +  f'{str(upper):>{digits}}'   + '\n' +
            margin + opflag + ' '*1  +  f'{str(lower):>{digits}}'   + '\n' +
            margin + '-'*(2 + digits) + '\n' + margin + ' '*(2 + digits - aLen))

def ask(a,b,c,op):
    global level
    start = time.perf_counter()
    user_guess = ""
    while not user_guess.isnumeric():
        user_guess = input(make_string(op,a,b,c))
        if not user_guess.isnumeric(): 
            print('numbers only please')
    user_guess = int(user_guess)    
    finish = time.perf_counter()
    elapsed = finish - start
    if not user_guess == c:
        if level > 5 : level -= 1
    return (user_guess == c, elapsed)

class Operation(object):
    def update(self,a, b, c, op):
        global level
        question_time = 0
        x = ask(a,b,c,op)
        correct = x[0]
        first_try = correct
        question_time += x[1]
        while correct == False:
            x = ask(a,b,c,op)
            correct = x[0]
            question_time += x[1]
        level += score(question_time)






class Addition(Operation):
    def question(self):
        a = random.randint(round(level - 4),round(level*2))
        b = random.randint(round(level - 4),round(level*2))
        c = a + b
        self.update(a,b,c,'+')

class Subtraction(Operation):
    def question(self):
        b = random.randint(round(math.log(level,2)),round(level*2))
        c = random.randint(round(math.log(level,2)),round(level*2))
        a = b + c
        self.update(a,b,c,'-')

class Multiplication(Operation):
    def question(self):
        a = random.randint(round(level/3), round(level*2/3 + 3))
        b = random.randint(3,10 + round(math.log(level, 16)))
        c = a*b
        self.update(a,b,c,'x')

class Division(Operation):
    def question(self):
        a = level*11
        while a >= level*10:
            c = random.randint(math.floor(level/3),math.ceil(level/2))
            b = random.randint(2,math.ceil(level/2))
            a = b*c
        self.update(a,b,c,'÷')

def challenge(limit, lvl = 5):
    global level
    level = lvl
    print('CALCULATOR QUEST BASIC')
    adds = Addition()
    subs = Subtraction()
    mult = Multiplication ()
    divs = Division()
    _ = input()
    current_time = time.time()
    limit = current_time + limit
    while current_time < limit:
        adds.question()
        current_time = time.time()
        if current_time > limit: break
        subs.question()
        current_time = time.time()
        if current_time > limit: break
        mult.question()
        current_time = time.time()
        if current_time > limit: break
        divs.question()
        current_time = time.time() 
    print('Great job! level: ' +  str(round(level)))
