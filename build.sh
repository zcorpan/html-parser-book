#!/bin/sh

replace() {
  # https://stackoverflow.com/questions/5694228/sed-in-place-flag-that-works-both-on-mac-bsd-and-linux#comment95713433_51060063
  sedi=(-i) && [ "$(uname)" == "Darwin" ] && sedi=(-i '') sed "${sedi[@]}" -e "s/$1/$2/" "$3"
}

find manuscript/ -type f -name "*.md" | while read -r file; do
  replace '```html' '{line-numbers=off,lang=html}\
~~~~~~~~' "$file"
  replace '```js' '{line-numbers=off,lang=js}\
~~~~~~~~' "$file"
  replace '```' '~~~~~~~~' "$file"
done
