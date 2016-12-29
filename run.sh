#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

api_adr=${API_URL:-https://api.opensensemap.org}
maptiles_adr=${MAPTILES_URL:-http://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png}

sed -i -e "s|OPENSENSEMAP_API_URL|$api_adr|g" -e "s|OPENSENSEMAP_MAPTILES_URL|$maptiles_adr|g" /usr/src/osem/dist/scripts/*.scripts.js

# gzip scripts.js after replacing URL placeholder
gzip -k -f /usr/src/osem/dist/scripts/*.scripts.js

# copy all files to the shared directory
mkdir -p /usr/src/app/dist
cp -rf /usr/src/osem/dist/* /usr/src/app/dist/

exec /bin/true
