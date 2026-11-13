#!/bin/sh
set -eu
mkdir -p public/assets
cp index.html style.css app.js contact.js catalog.js hero-carousel.js featured-carousel.js featured-carousel.css luxury-atelier-20261114.css luxury-atmosphere-20261114.js navigation-controls-20261114.css public/
cp -R assets/. public/assets/
printf 'JUXIANG static website ready\n'
