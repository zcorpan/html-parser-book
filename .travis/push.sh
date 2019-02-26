#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org" || exit 1
  git config --global user.name "Travis CI" || exit 1
}

commit_files() {
  git checkout -b leanpub || exit 1
  git add manuscript/*.md || exit 1
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER" || exit 1
}

upload_files() {
  git remote add zcorpan https://${GH_TOKEN}@github.com/zcorpan/html-parser-book.git > /dev/null 2>&1 || exit 1
  git push --quiet --set-upstream zcorpan leanpub || exit 1
}

setup_git
commit_files
upload_files
