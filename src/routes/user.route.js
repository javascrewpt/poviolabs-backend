'use strict';

const Joi = require('joi');

const UserController = require('../controllers/user');

module.exports = [{
    method: 'POST',
    path: '/signup',
    handler: UserController.signup,
    options: {
        auth: false,
        validate: {
            payload: {
                username: Joi.string().min(3).max(30).required(),
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
                username: Joi.string().min(3).max(30).required(),
                password: Joi.string().min(3).max(200).required()
            }
        }
    }
}, {
    method: 'GET',
    path: '/me',
    handler: UserController.me,
    options: {
        auth: 'jwt'
    }
}, {
    method: 'POST',
    path: '/update-password',
    handler: UserController.updatePassword,
    options: {
        auth: 'jwt',
        validate: {
            payload: {
                oldPassword: Joi.string().min(3).max(200).required(),
                newPassword: Joi.string().min(3).max(200).required()
            }
        }
    }
}, {
    method: 'GET',
    path: '/user/{id}',
    handler: UserController.userId,
    options: {
        auth: false
    }
}, {
    method: 'GET',
    path: '/user/{id}/like',
    handler: UserController.like,
    options: {
        auth: 'jwt'
    }
}, {
    method: 'GET',
    path: '/user/{id}/unlike',
    handler: UserController.unlike,
    options: {
        auth: 'jwt'
    }
}, {
    method: 'GET',
    path: '/most-liked',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'optional'
        },
        handler: UserController.mostLiked
    }
}];
