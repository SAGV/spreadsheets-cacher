#!/bin/sh

set -e

dirname=`dirname "$0"`
cd "$dirname/.."
echo "PHASE: Release..."

if [ "$1" = "--help" ]; then
  echo "usage: $PROGNAME [STAGE]" >&2
  echo >&2
  echo "Deploy Docker image and tag STAGE. If omitted, STAGE is inferred." >&2
  exit 1
fi

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
stage=`echo "$stage" | sed -e 's#^.*/##' | tr '.-' '_'`

gitrev=`git rev-parse HEAD`

docker build --pull --tag=goabout/spreadsheets-cacher:$gitrev .
docker tag --force goabout/spreadsheets-cacher:$gitrev goabout/spreadsheets-cacher:$stage
if [ "$stage" = "master" ]; then
  docker tag --force goabout/spreadsheets-cacher:$gitrev goabout/spreadsheets-cacher
fi

docker push goabout/spreadsheets-cacher:$gitrev
docker push goabout/spreadsheets-cacher:$stage
if [ "$stage" = "master" ]; then
  docker push goabout/spreadsheets-cacher
fi
