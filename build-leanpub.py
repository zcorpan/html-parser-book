#!/usr/bin/env python3
import fileinput

conversions = [
  ['```dom-tree', '```'],
]

def replace_inline(filename):
    with fileinput.FileInput(filename, inplace=True) as file:
        for line in file:
            for c in conversions:
                line = line.replace(c[0], c[1])
            print(line, end='')

if (len(conversions) > 0):
    with open('manuscript/Book.txt') as book:
        for filename in book:
            replace_inline('manuscript/' + filename.rstrip('\n'))
