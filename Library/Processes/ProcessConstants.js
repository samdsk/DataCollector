const ProcessTypes = {
    SERVER: {
        name: 'SERVER',
        path: './ProcessAPIServer',
        dbRequired: true
    },
    COLLECTOR: {
        name: 'COLLECTOR',
        path: './ProcessCollector',
        dbRequired: true
    },
};


export {ProcessTypes};