const path = require('path');

const ProcessTypes = {
    SERVER: {
        name: 'SERVER',
        path: path.resolve(__dirname, './APIServerApp')
        ,
        dbRequired: true
    },
    COLLECTOR: {
        name: 'COLLECTOR',
        path: path.resolve(__dirname, './CollectorApp'),
        dbRequired: true
    },
};


module.exports = {ProcessTypes};