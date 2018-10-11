'use strict';

const UserController =  require('../controllers/user');

module.exports = [{
    method: 'GET',
    path: '/most-liked',
    options: {
        auth: false
    },
    handler: UserController.list
}];
