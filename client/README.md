# ViMA client

## Client setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Client configuration

### The project expects a .env file with the following variables

* VITE_NAME - the title of the page
* VITE_SERVER_URL - the url of the server api
* VITE_S3_URL - the base url of the image bucket / server
* VITE_DEBUG - debug mode on (1) or off (0)
* VITE_MODE - sets the matching cookie sameSite attribute (production ? None : Lax)
* VITE_SERVER_DOMAIN - the domain of the api server
* VITE_SHOW_HELP_BUTTON - is a temporary fix for displaying (1) or not displaying (0) a special header row

Example:
```
VITE_NAME=A site title
VITE_SERVER_URL=http://localhost:8080/
VITE_S3_URL=https://your-bucket.s3.eu-central-1.amazonaws.com/
VITE_DEBUG=0
VITE_MODE=production
VITE_SERVER_DOMAIN=localhost
VITE_SHOW_HELP_BUTTON=1
```