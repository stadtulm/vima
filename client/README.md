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
* VUE_APP_DEBUG=1 - debug mode on (1) or off (0)

Example:
```
VUE_APP_NAME=A site title
VUE_APP_SERVER_URL=http://localhost:8080/
VUE_APP_S3_URL=https://your-bucket.s3.eu-central-1.amazonaws.com/
VUE_APP_DEBUG=0
```