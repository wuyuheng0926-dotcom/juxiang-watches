#!/bin/sh
set -eu
mkdir -p public/assets
cp visual-quick-index-20261114.js visual-search-engine.js visual-search-20261114.js visual-search-20261114.css visual-index-20261114.json locale-catalog-20261114.js interface-polish-20261114.css site-languages-20261114.js index.html style.css app.js contact.js catalog.js hero-carousel.js featured-carousel.js featured-carousel.css luxury-atelier-20261114.css luxury-atmosphere-20261114.js navigation-controls-20261114.css art-lettering-20261114.css art-intro-20261114.js light-gallery-20261114.css jade-glass-20261114.css jade-glass-20261114.js imperial-jade-20261114.css individual-watch-20261114.css public/
cp -R assets/. public/assets/
cp -R visual-model public/
cat import-photos-20261114/part-*.bin | tar -xz -C public/assets
cat import-patek-20261114/part-*.bin | tar -xz -C public/assets
printf 'JUXIANG static website ready\n'
