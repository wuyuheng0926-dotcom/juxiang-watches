#!/bin/sh
set -eu
test -f index.html
test -f catalog.js
test -d assets
printf "JUXIANG static website ready\n"
