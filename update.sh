#!/bin/sh

cd /var/www/unique

#git checkout package-lock.json
git pull
npm install
#git checkout package-lock.json

# User id 33 is www-data
XDG_RUNTIME_DIR=/run/user/33 systemctl --user restart uniqueweb
