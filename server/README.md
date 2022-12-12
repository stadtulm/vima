# ViMA server

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/server
    npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Server configuration

### The server expects a .env file with the following variables

* SMTP_HOST - the smtp email host
* SMTP_USER - the name of the smtp server user
* SMTP_PASS - the password for the smtp server
* FROM_EMAIL - the vima server app email address
* CLIENT_URL - the vima client base url
* CORS_ALLOWLIST - a comma separated list of allowed origins for cors
* AWS_ACCESS_KEY_ID - the aws access id for the s3 bucket
* AWS_SECRET_ACCESS_KEY - the aws secret access key for the s3 bucket
* AWS_BUCKET_NAME - s3 bucket name
* S3_LINK - base path of the s3 bucket
* LOG_LEVEL - defines the log level to be used
* FEATHERS_SYNC - if feather sync should be enabled (1) (currently not supported) or not (0)
* REDIS_PW - password for your redis db (for feathers sync) (currently not supported)
* REDIS_URL - url to your redis db (for feathers sync) (currently not supported)
* DEEPL_AUTH_KEY - the deepl auth key
* GOOGLE_APPLICATION_CREDENTIALS - path to the google application credentials needed for translation
GOOGLE_APPLICATION_CREDENTIALS=./vima-345111-8f6ad0c72d9b.json

Example:
```
SMTP_HOST=smtp.example.de
SMTP_USER=noreply@example.de
SMTP_PASS=yourpassword
FROM_EMAIL=ViMA Ulm <noreply@example.de>
CLIENT_URL=http://localhost:8081/
CORS_ALLOWLIST=http://localhsot:8081/,http://vima-ulm.de/
AWS_ACCESS_KEY_ID=1234567890
AWS_SECRET_ACCESS_KEY=abcedfghijklmno123456789
AWS_BUCKET_NAME=your-bucket
S3_LINK=https://your-bucket.s3.eu-central-1.amazonaws.com/
LOG_LEVEL=debug
FEATHERS_SYNC=0
REDIS_PW=tba
REDIS_URL=redis-12345.12345.eu-central-1-1.ec2.cloud.redislabs.com:19383/0
DEEPL_AUTH_KEY=123456789
GOOGLE_APPLICATION_CREDENTIALS=./path-to-your/credentials.json
```

## The server expects a feathers configuration file within the config folder

Example:
```
{
  "host": "localhost",
  "port": 8080,
  "public": "../public/",
  "paginate": {
    "default": 24,
    "max": 480
  },
  "authentication": {
    "entity": "user",
    "service": "users",
    "secret": "1234567890",
    "authStrategies": [
      "jwt",
      "local",
      "api",
      "anonymous"
    ],
    "jwtOptions": {
      "header": {
        "typ": "access"
      },
      "audience": "https://example.de",
      "issuer": "feathers",
      "algorithm": "HS256",
      "expiresIn": "5d"
    },
    "local": {
      "usernameField": "email",
      "passwordField": "password"
    }
  },
  "mongodb": "mongodb+srv://cluster0.1234.mongodb.net"
}
```
