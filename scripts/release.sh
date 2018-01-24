#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

if [ ! -f "./scripts/.env" ]; then
  echo "Error:"
  echo "File .env does not exists. Please create this file and add a variable called GH_TOKEN."
  echo "Exiting ..."
  exit
fi

source ./scripts/.env

npm run release &&
git push origin master &&
conventional-github-releaser -p angular -r 0 -t $GH_TOKEN
