#!/bin/sh
set -eu
rm -rf public/visual-model
rm -f public/visual-search-engine.js public/visual-search-20261114.js public/visual-search-20261114.css public/visual-index-20261114.json public/visual-quick-index-20261114.js
mkdir -p public/assets public/admin
node tools/export-admin-catalog.cjs
cp catalogue-sync.js price-access.js public/
cp admin/index.html public/admin/index.html
cp navigation-refresh-20261114.css locale-catalog-20261114.js interface-polish-20261114.css site-languages-20261114.js index.html style.css app.js contact.js catalog.js hero-carousel.js featured-carousel.js featured-carousel.css luxury-atelier-20261114.css luxury-atmosphere-20261114.js navigation-controls-20261114.css art-lettering-20261114.css art-intro-20261114.js light-gallery-20261114.css jade-glass-20261114.css jade-glass-20261114.js imperial-jade-20261114.css individual-watch-20261114.css public/
cp -R assets/. public/assets/
cat import-photos-20261114/part-*.bin | tar -xz -C public/assets
cat import-patek-20261114/part-*.bin | tar -xz -C public/assets
cat import-mobile-speed-20261114/part-*.bin | tar -xz -C public/assets
cat import-selected-hero-20261114/part-000.bin | tar -xz -C public/assets
cat import-supplement-20261114/part-*.bin | tar -xz -C public/assets
node tools/optimize-mobile.cjs
printf 'JUXIANG static website ready\n'
