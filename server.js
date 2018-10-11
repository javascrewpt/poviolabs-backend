'use strict';

const Hapi = require('hapi');

const BaseRoute = require('./src/routes/base.route');
const UserRoute = require('./src/routes/user.route');
const DB = require('./src/utils/db');
const { key } = require('./src/utils/config');

const validate = (decoded, request) => {

    // TODO
    return { isValid: true };
};


const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    try {
        DB.connect();
        await server.register(require('hapi-auth-jwt2'));
        server.auth.strategy('jwt', 'jwt',
            {
                key,
                validate,
                verifyOptions: { algorithms: ['HS256'] }
            });
        server.auth.default('jwt');
        server.route([...BaseRoute, ...UserRoute]);
        await server.start();

        console.log(`Server running at: ${server.info.uri}`);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }


};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

module.exports = server;
