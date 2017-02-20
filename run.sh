#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

# copy all files to the shared directory
mkdir -p /usr/src/app/dist
cp -rf /usr/src/osem/dist/* /usr/src/app/dist/

exec /bin/true
