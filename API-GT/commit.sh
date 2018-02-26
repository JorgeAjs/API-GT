#!/bin/bash
git checkout GT_desarrollo
git add .
git status
echo "¿Titulo de los cambios?"
read titulo
git commit -am "$titulo"
git push


#reached files
#git rm . -r --cached
#git add .
#git commit -m "fixed untracked files"
