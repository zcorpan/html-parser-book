#!/bin/sh

replace() {
  perl -p -i -e "s/$1/$2/g" "$3"
}

find manuscript/ -type f -name "*.md" | while read -r file; do
  replace '```html' '{line-numbers=off,lang=html}\n~~~~~~~~' "$file"
  replace '```js' '{line-numbers=off,lang=js}\n~~~~~~~~' "$file"
  replace '```' '~~~~~~~~' "$file"
done
