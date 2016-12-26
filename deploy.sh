npm run build
gh-pages -d dist
git checkout gh-pages
git pull origin gh-pages
git checkout master
