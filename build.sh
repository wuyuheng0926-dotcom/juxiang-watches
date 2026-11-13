#!/bin/sh
set -eu
mkdir -p public/assets
cp index.html style.css app.js contact.js catalog.js hero-carousel.js public/
cp -R assets/. public/assets/
printf 'JUXIANG static website ready\n'
