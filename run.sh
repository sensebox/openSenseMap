#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

api_adr=${API_URL:-https://api.opensensemap.org}
ocpu_adr=${OCPU_URL:-https://public.opencpu.org/ocpu/github/mdragunski/inteRsense/R}

sed -i -e "s|OPENSENSEMAP_API_URL|$api_adr|" -e "s|OPENCPU_ENDPOINT|$ocpu_adr|" /usr/src/app/dist/scripts/*.scripts.js

exec /bin/true
