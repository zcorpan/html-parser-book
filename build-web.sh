#!/bin/bash

find manuscript -name "*.md" | while read -r file; do
  showdown makehtml --quiet --ghCompatibleHeaderId --tables --ghCodeBlocks -i "$file" -o "${file/.*}.html" || exit 1
done
