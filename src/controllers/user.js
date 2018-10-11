'use strict';

const User = require('../models/user');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const { key } = require('../utils/config');
const { hash, compare } = require('../utils/helper');

// List of users
module.exports.list = async (request, h) => {

    try {
        const users = await User.find({}).exec();
        return { users };

    }
    catch (error) {
        return Boom.badRequest(error.message);
    }
};

module.exports.signup = async (request, h) => {

    try {
        const password = await hash(request.payload.password);

        const userData = {
            username: request.payload.username,
            password,
            likes: []
        };

        const { username, _id } = await User.create(userData);

        const token = JWT.sign({ username, _id }, key);

        return token;

    }
    catch (error) {
        console.log('error!', error);
        return Boom.badRequest(error.message);
    }
};

module.exports.login = async (request, h) => {

    try {
        const user = await User.findOne({ username: request.payload.username }).exec();
        if (user) {
            const passwordCorrect = await compare(request.payload.password, user.password);
            if (passwordCorrect) {
                const { username, _id } = user;
                const token = JWT.sign({ username, _id }, key);
                return token;
            }

            return Boom.badRequest('Wrong password!');
        }

        return Boom.badRequest('Username does not exist!');
    }
    catch (error) {
        console.log('error!', error);
        return Boom.badRequest(error.message);
    }
};
