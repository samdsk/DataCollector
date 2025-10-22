# Data Collector

This web application is designed to collect data for LLM training,
it periodically collects data from third party data sources and
provides an API to annotate and access them.

## Prerequisites

- Node.js 17 or higher
- MongoDB database
- npm package manager

## Configuration

### Required Configuration Files

The application requires specific configuration files in the `config` folder:

```aiignore
config/ 
├── RapidAPI/ 
│ ├── keylist.json 
│ └── jobtypelist.json 
└── (other config files as needed)
```
#### `config/RapidAPI/keylist.json` Array of API keys for RapidAPI services:

#### `config/RapidAPI/jobtypelist.json` Array of job types to search for:

### Environment Variables

Create a `.env` file in the root directory with the following variables:

#### required

```bash
    ## mongo db config
    DB_USER= mongodb username
    DB_PASSWORD= mongodb password
    DB_URI= mongodb url (...mongodb.net)
    DB_NAME= collection name
    
    ## jwt config
    SERVER_SECRET_KEY= jwt encryption key
    SERVER_SESSION_DURATION= jwt session duration default 3h
    
    ## rapid api config
    RAPID_API_API_HOST= rapid api host
    RAPID_API_API_URL= rapid api url
    
    RAPID_API_KEYS_FILENAME=./config/RapidAPI/keylist.json
    RAPID_API_JOBTYPES_FILENAME=./config/RapidAPI/jobtypelist.json
    RAPID_API_API_KEY=****
```

#### optional

```bash
    API_LOCATION= default Italia
    API_LANGUAGE= default it_IT
    REQUEST_LIMIT= default 3
    SERVER_SESSION_DURATION= default 3h
    
    ## retry with delay config
    MAX_RETRIES= default 5
    ERROR_WINDOW= default 60000ms
    DELAY_BETWEEN_REQUESTS= default 1000ms
    
    # collector process registry config
    COLLECTOR_RUN_CONFIG_PATH=./config/collectors_run_config.json

    ## log
    LOG_LEVEL= default info
    
    ## retry with delay
    MAX_RETRIES= default 5
    ERROR_WINDOW= default 3000ms    
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the required configuration directory structure:
   ```bash
   mkdir -p config/RapidAPI
   ```

4. Create configuration files:
    - `config/RapidAPI/keylist.json` - Add your RapidAPI keys
    - `config/RapidAPI/jobtypelist.json` - Add job types to collect

5. Create `.env` file with required environment variables (see configuration section above)

## Usage

### Method 1: npm script

```bash
npm run start
```

### Method 2: Direct node execution

```bash
node index 
```

### Method 3: PM2 process manager

```bash

pm2 start index.js --name data-collector 
pm2 save 
pm2 logs data-collector 
pm2 stop data-collector
```
