#!/bin/sh

set -e

dirname=`dirname "$0"`
cd "$dirname/.."
echo "PHASE: Release..."

docker build --pull --tag=goabout/$PROJECT:$GITREV .
docker tag goabout/$PROJECT:$GITREV goabout/$PROJECT:$TAG

if [ "$TAG" = master ]; then
  docker tag goabout/$PROJECT:$GITREV goabout/$PROJECT:latest
  docker push goabout/$PROJECT:latest
fi

docker push goabout/$PROJECT:$GITREV
docker push goabout/$PROJECT:$TAG
