#!/bin/bash

html="<!doctype html>
<meta charset=utf-8>
<meta name=viewport content='width=device-width,initial-scale=1'>
<link rel=stylesheet href=style.css>
"

find manuscript -name "*.md" | while read -r file; do
  title="${file/.*}"
  title="${title/*\//}"
  title="${title/-/ }"
  title="${title/dom /DOM }"
  title=`echo ${title:0:1} | tr  '[a-z]' '[A-Z]'`${title:1}
  echo "$html<title>$title - The HTML Parser Book</title>" > "${file/.*}.html" || exit 1
  showdown makehtml --quiet --ghCompatibleHeaderId --tables --ghCodeBlocks -i "$file" >> "${file/.*}.html" || exit 1
done
