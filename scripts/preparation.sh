#!/bin/sh

# Make sure to run this script in common context, otherwise values won't be exported
# Like . scripts/preparation-common.sh

set -e

dirname=`dirname "$0"`
echo "PHASE: Preparation..."

# Determine current stage and Git commit
if [ "$1" ]; then
  stage="$1"
elif [ "$TRAVIS_PULL_REQUEST" -a "$TRAVIS_PULL_REQUEST" != "false" ]; then
  stage="pr$TRAVIS_PULL_REQUEST"
elif [ "$TRAVIS_BRANCH" ]; then
  stage="$TRAVIS_BRANCH"
else
  stage=`git rev-parse --abbrev-ref HEAD`
fi

export PROJECT=${TRAVIS_REPO_SLUG#*/}
if [ -z "$PROJECT" ]; then
  echo "PROJECT empty, aborting" >&2
  exit 1
fi

export TAG=$(echo "$stage" | sed -e 's#^.*/##' | tr -d '\n' | tr -c 'A-Za-z0-9' '-' | tr 'A-Z' 'a-z')

export GITREV=`git rev-parse HEAD`

STACKFILE=docker/stack-dev.yml
NAME="$PROJECT-$TAG"

export STACKFILE NAME

echo "Pushing $PROJECT tagged as $TAG, gitrev is $GITREV"
