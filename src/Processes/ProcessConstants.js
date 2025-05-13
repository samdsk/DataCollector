const path = require('path');

const ProcessTypes = {
    SERVER: {
        name: 'SERVER',
        path: path.resolve(__dirname, './ProcessAPIServer')
        ,
        dbRequired: true
    },
    COLLECTOR: {
        name: 'COLLECTOR',
        path: path.resolve(__dirname, './ProcessCollector'),
        dbRequired: true
    },
};


module.exports = {ProcessTypes};