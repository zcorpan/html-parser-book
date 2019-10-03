#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org" || exit 1
  git config --global user.name "Travis CI" || exit 1
}

commit_files() {
  git mv -k _assets/img manuscript/images || exit 1  # build-leanpub.py rewrites these references
  git add manuscript/* || exit 1
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER" || exit 1
  git tag "v$TRAVIS_BUILD_NUMBER" || exit 1
}

upload_files() {
  git remote add zcorpan https://${GH_TOKEN}@github.com/zcorpan/html-parser-book.git > /dev/null 2>&1 || exit 1
  git push -f zcorpan HEAD:leanpub || exit 1
}

setup_git
commit_files
upload_files
