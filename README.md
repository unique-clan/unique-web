# Unique Clan Website
Copyright (c) 2020 [edg-l](https://github.com/edg-l), [Tezcan](https://github.com/hopetez), [timakro](https://github.com/timakro)

# Dependencies
- [Node.js](https://nodejs.org/en/) (recommended LTS)
- ~~[Sass](https://sass-lang.com/install)~~
- ~~[MongoDB](https://www.mongodb.com/)~~

# Environment variables
- Server: `PORT` (default `3000`), `BEHIND_PROXY` node.js is behind reverse proxy? (default `false`)
- MySQL: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Serverstatus: `SERVERS_LOCATION` location of servers.json file
- Maps: `MAPS_LOCATION` location of map directory with images (and maps)
- MongoDB: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` (default `"uniqueweb"`)
- Cookies: `COOKIE_SECRET` cookie signing key, `COOKIE_SECURE` only send cookies via HTTPS? (default `false`)
- ReCAPTCHA: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- Password storage: `SALT_WORK_FACTOR` (default `10`)
- Admin dashboard password: `ADMIN_DASHBOARD_PW` the password (default `1234`)

# How-to
- `git clone https://github.com/unique-clan/unique-web`
- `cd unique-web`
- `npm install`
- `npm start` Will listen on `localhost:3000` by default

# Javascript style
We follow [StandardJS](https://standardjs.com/)
