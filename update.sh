#!/bin/sh

cd /home/uniqueweb/unique-web

# exit if up to date
git remote update >/dev/null 2>&1
[ "$(git rev-parse @)" = "$(git rev-parse @{upstream})" ] && exit

(
lockfile -r 0 update.lock || exit

git pull

#rm -rf node_modules/
#rm -f package-lock.json
#npm install
npm ci

XDG_RUNTIME_DIR=/run/user/$(id -u) systemctl --user restart uniqueweb

rm -f update.lock
) >update.log 2>&1
