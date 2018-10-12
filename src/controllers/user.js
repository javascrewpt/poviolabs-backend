'use strict';

const User = require('../models/user');
const Boom = require('boom');
const Mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const { key } = require('../utils/config');
const { hash, compare } = require('../utils/helper');

const getUser = async (id) => {

    try {
        const user = await User.aggregate([
            { $match: { _id: id } },
            {
                $project: {
                    username: 1,
                    noOfLikes: {
                        $size: '$likes'
                    }
                }
            }
        ]).exec();
        return user[0];
    }
    catch (error) {
        return error;
    }
};

// Sign up to the system (username, password)
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

        return { jwt: token };

    }
    catch (error) {
        console.log('error!', error);
        return Boom.badRequest(error.message);
    }
};

// Logs in an existing user with a password
module.exports.login = async (request, h) => {

    try {
        const user = await User.findOne({ username: request.payload.username }).exec();
        if (user) {
            const passwordCorrect = await compare(request.payload.password, user.password);
            if (passwordCorrect) {
                const { username, _id } = user;
                const token = JWT.sign({ username, _id }, key);
                return { jwt: token };
            }

            return Boom.badRequest('Wrong password!');
        }

        return Boom.badRequest('Username does not exist!');
    }
    catch (error) {
        return Boom.badRequest(error.message);
    }
};

// Get the currently logged in user information
module.exports.me = async (request, h) => {

    try {
        const id = Mongoose.Types.ObjectId(request.auth.credentials._id);
        const user = await getUser(id);
        return user;
    }
    catch (error) {
        return error;
    }
};

// List username & number of likes of a user
module.exports.userId = async (request, h) => {

    try {
        const id = Mongoose.Types.ObjectId(encodeURIComponent(request.params.id));
        const user = await getUser(id);
        return user;
    }
    catch (error) {
        return error;
    }
};

// Like a user
module.exports.like = async (request, h) => {

    try {
        const id = Mongoose.Types.ObjectId(request.auth.credentials._id);
        const likeId = Mongoose.Types.ObjectId(encodeURIComponent(request.params.id));

        if (id.equals(likeId)) {
            return Boom.badRequest(`You can't like yourself!`);
        }

        const alreadyLiked = await User.findOne({
            _id: likeId,
            likes: id
        }).exec();

        if (!alreadyLiked) {
            const updated = await User.findByIdAndUpdate(likeId, {
                $push: {
                    likes: id
                }
            }, { new: true }).exec();

            return updated;
        }

        return Boom.badRequest(`Already liked the user!`);
    }
    catch (error) {
        return error;
    }
};

// Unlike a user
module.exports.unlike = async (request, h) => {

    try {
        const id = Mongoose.Types.ObjectId(request.auth.credentials._id);
        const unlikeId = Mongoose.Types.ObjectId(encodeURIComponent(request.params.id));

        const amongTheLikes = await User.findOne({
            _id: unlikeId,
            likes: id
        }).exec();

        if (amongTheLikes) {
            const updated = await User.findByIdAndUpdate(unlikeId, {
                $pull: {
                    likes: id
                }
            }, { new: true }).exec();

            return updated;
        }

        return Boom.badRequest('Not among the users that liked the person!');
    }
    catch (error) {
        return error;
    }
};

// List users in a most liked to least liked
module.exports.list = async (request, h) => {

    try {
        const id = request.pre.userId;
        const users = await User.aggregate([{
            $project: {
                _id: 1,
                username: 1,
                didLike: {
                    $in: [id, '$likes']
                },
                noOfLikes: {
                    $size: '$likes'
                }
            }
        },
        {
            $sort: { 'numberOfItems': -1 }
        }

        ]).exec();
        return { users };

    }
    catch (error) {
        return Boom.badRequest(error.message);
    }
};
