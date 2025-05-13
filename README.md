# Data Collector

This web application is designed to collect data for LLM training,
it periodically collects data from third party data sources and
provides an API to annotate and access them.

## Prerequisites

### Environment variables

```
// .env

# required

    ## db config
    DB_USER= mongodb username
    DB_PASSWORD= mongodb password
    DB_URI= mongodb url (...mongodb.net)
    DB_NAME= collection name
    
    ## jwt
    SERVER_SECRET_KEY= jwt encryption key
    
    ## api config
    API_HOST= api host
    API_URL= api url
    
    KEYS_FILENAME=./config/RapidAPI/keylist.json # array
    JOBTYPES_FILENAME=./config/RapidAPI/jobtypelist.json # array

# optional
    API_LOCATION= default Italia
    API_LANGUAGE= default it_IT
    REQUEST_LIMIT= default 3
    SERVER_SESSION_DURATION= default 3h

    ## log
    LOG_LEVEL= default info
    
    ## retry with delay
    MAX_RETRIES= default 5
    ERROR_WINDOW= default 3000ms
```

## Usage

```
npm install

# 1 method to run
npm run start

# 2 method to run
node index 

# 3 method to run
pm2 start index.js --name data-collector
pm2 save
pm2 logs data-collector
pm2 stop data-collector
```
