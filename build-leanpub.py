#!/usr/bin/env python3
import fileinput
import re

def slugify(title):
    title = title.lower()
    title = re.sub(r"\s+", '-', title)
    title = re.sub(r"[():.,&'`]", '', title);
    return title

def rewrite_ref(m):
    title = m.group(1)
    slug = slugify(title)
    return "[" + title + "](#" + slug + ")"

def add_heading_id(m):
    line = m.group(0)
    title = m.group(1)
    slug = slugify(title)
    return "{#" + slug + "}\n" + line

conversions = [
  ['```dom-tree', '```'],
  ['/_assets/img/', 'images/'],  # .travis/push.sh moves these files - also see https://leanpub.com/markua/read#leanpub-auto-local-resources
  [r'\{% ref "[^"]+", "([^"]+)" %\}', rewrite_ref],
  [r'^#+ (.+)$', add_heading_id],
  ['...', '…'],  # same transform in .eleventy.js
]

def replace_inline(filename):
    with fileinput.FileInput(filename, inplace=True) as file:
        for line in file:
            for c in conversions:
                if (callable(c[1])):
                    line = re.sub(c[0], c[1], line)
                else:
                    line = line.replace(c[0], c[1])
            print(line, end='')

if (len(conversions) > 0):
    with open('manuscript/Book.txt') as book:
        for filename in book:
            replace_inline('manuscript/' + filename.rstrip('\n'))
