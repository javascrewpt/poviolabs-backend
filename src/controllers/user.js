'use strict';

const User = require('../models/user');
const Boom = require('boom');

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
