#!/bin/sh

set -e

dirname=`dirname "$0"`
cd "$dirname/.."
echo "PHASE: Deploy..."

# Do not run if a deploy job is waiting otherwise run the deploy
curl -fs \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token $TRAVIS_TOKEN" \
   "https://api.travis-ci.com/repo/goabout%2Finfra-stacks/builds?state=created" | grep -q created_by && echo "Infra-stacks were already scheduled ;-)" || \
curl -fs -X POST \
   -H "Content-Type: application/json" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token $TRAVIS_TOKEN" \
   -d "{\"request\":{\"branch\":\"master\",\"message\":\"Trigger deployment for $NAME\"}}" \
   https://api.travis-ci.com/repo/goabout%2Finfra-stacks/requests
