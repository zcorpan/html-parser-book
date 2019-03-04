#!/bin/sh

find manuscript -name "*.md" | while read -r file; do
  node_modules/showdown/bin/showdown.js makehtml --quiet --ghCompatibleHeaderId --tables --ghCodeBlocks -i "$file" -o "${file/.*/}.html" | exit 1
done
