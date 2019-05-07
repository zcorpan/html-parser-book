#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org" || exit 1
  git config --global user.name "Travis CI" || exit 1
}

commit_files() {
  git mv -k _assets/img manuscript/_assets/img || exit 1
  git add manuscript/* || exit 1
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER" || exit 1
}

upload_files() {
  git remote add zcorpan https://${GH_TOKEN}@github.com/zcorpan/html-parser-book.git > /dev/null 2>&1 || exit 1
  git push -f zcorpan master:leanpub || exit 1
}

setup_git
commit_files
upload_files
