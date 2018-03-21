#!/bin/sh
set -e

dirname=`dirname "$0"`

section() {
  [ -z "$TRAVIS" ] || echo -en "travis_fold:start:$1\\r"
  scripts/$1.sh
  [ -z "$TRAVIS" ] || echo -en "travis_fold:end:$1\\r"
}

chmod -R +x ./scripts

# Run preparation in current context to export vars
. scripts/preparation.sh

# Custom test script
section setup
section test
section release
section deploy
