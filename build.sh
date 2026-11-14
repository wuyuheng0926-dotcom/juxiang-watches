#!/bin/sh
set -eu
mkdir -p public/assets
cp interface-polish-20261114.css site-languages-20261114.js index.html style.css app.js contact.js catalog.js hero-carousel.js featured-carousel.js featured-carousel.css luxury-atelier-20261114.css luxury-atmosphere-20261114.js navigation-controls-20261114.css art-lettering-20261114.css art-intro-20261114.js light-gallery-20261114.css jade-glass-20261114.css jade-glass-20261114.js imperial-jade-20261114.css individual-watch-20261114.css public/
cp -R assets/. public/assets/
cat import-photos-20261114/part-*.bin | tar -xz -C public/assets
printf 'JUXIANG static website ready\n'
