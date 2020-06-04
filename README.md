# Unique Clan Website
Copyright (c) 2020 [edg-l](https://github.com/edg-l), [Tezcan](https://github.com/tezcan52), [timakro](https://github.com/timakro)

# Dependencies
- [Sass](https://sass-lang.com/install)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/en/) (recommended LTS)

# Environment variables
- Server: `PORT` (default `3000`), `BEHIND_PROXY` node.js is behind reverse proxy? (default `false`)
- MongoDB: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` (default `"uniqueweb"`)
- MySQL: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Cookies: `COOKIE_SECRET` cookie signing key, `COOKIE_SECURE` only send cookies via HTTPS? (default `false`)
- ReCAPTCHA: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- Password storage: `SALT_WORK_FACTOR` (default `10`)
- Serverstatus: `SERVERS_LOCATION` location of servers.json file (default `servers.json`)
- Admin dashboard password: `ADMIN_DASHBOARD_PW` the password (default `1234`)
- Maps: `MAPS_LOCATION` location of map directory with images (and maps)

# How-to
- `git clone https://github.com/unique-clan/unique-web`
- `cd unique-web`
- `npm install`
- `npm start` Will listen on `localhost:3000` by default

# Production how-to
- Clone repository to `/var/www` and chown to www-data
- Copy `run.sh.default` to `run.sh` and set passwords.
- Install systemd user unit and enable for user www-data.
- Don't forget to `loginctl enable-linger www-data`

# Javascript style
We follow [StandardJS](https://standardjs.com/)
