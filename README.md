# Data Collector

This web application is designed to collect data for LLM training,
it periodically collects data from third party data sources and
provides an API to annotate and access them.

## Prerequisites

### Environment variables

```
// .env

// required
API_HOST= api host
API_URL= api url
DB_USER= mongodb username
DB_PASSWORD= mongodb password
DB_URI= mongodb url (...mongodb.net)
DB_NAME= collection name
KEYS_FILENAME= path to json token array
JOBTYPES_FILENAME= path to json job type array
SERVER_SECRET_KEY= jwt encryption key

// optional
API_LOCATION= default Italia
API_LANGUAGE= default it_IT
REQUEST_LIMIT= default 3
SERVER_SESSION_DURATION= default 3h
LOG_LEVEL= default info
```

## Usage

```
node index
```
