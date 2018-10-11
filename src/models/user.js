'use strict';

const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userModel = new Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    likes: [{ type: ObjectId, ref: 'User' }]
});

module.exports = Mongoose.model('User', userModel, 'users');
