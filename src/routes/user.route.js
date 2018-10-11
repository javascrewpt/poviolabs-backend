'use strict';

const Joi = require('joi');

const UserController = require('../controllers/user');

module.exports = [{
    method: 'GET',
    path: '/most-liked',
    options: {
        auth: false
    },
    handler: UserController.list
}, {
    method: 'POST',
    path: '/signup',
    handler: UserController.signup,
    options: {
        auth: false,
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                password: Joi.string().min(3).max(200).required()
            }
        }
    }
}, {
    method: 'POST',
    path: '/login',
    handler: UserController.login,
    options: {
        auth: false,
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                password: Joi.string().min(3).max(200).required()
            }
        }
    }
}];
