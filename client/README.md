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

* VUE_APP_NAME - the title of the page
* VUE_APP_SERVER_URL - the url of the server api
* VUE_APP_S3_URL - the base url of the image bucket / server
* VUE_APP_DEBUG - debug mode on (1) or off (0)
* VUE_APP_MODE - sets the matching cookie sameSite attribute (production ? None : Lax)
* VUE_APP_SERVER_DOMAIN - the domain of the api server
* VUE_APP_SHOW_HELP_BUTTON - is a temporary fix for displaying (1) or not displaying (0) a special header row

Example:
```
VUE_APP_NAME=A site title
VUE_APP_SERVER_URL=http://localhost:8080/
VUE_APP_S3_URL=https://your-bucket.s3.eu-central-1.amazonaws.com/
VUE_APP_DEBUG=0
VUE_APP_MODE=production
VUE_APP_SERVER_DOMAIN=localhost
VUE_APP_SHOW_HELP_BUTTON=1
```