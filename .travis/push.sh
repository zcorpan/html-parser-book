#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_files() {
  git checkout -b leanpub
  git add manifest/*.md
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add zcorpan https://${GH_TOKEN}@github.com/MVSE-outreach/resources.git > /dev/null 2>&1
  git push --quiet --set-upstream zcorpan leanpub
}

setup_git
commit_files
upload_files
