'use strict';

const Mongoose = require('mongoose');
const Config = require('./config');

const { url, user, pass } = Config;

module.exports.connect = () => {

    Mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true, user, pass });
    const db = Mongoose.connection;

    db.on('error', (e) => {

        console.log('connection error:', e);
    });

    db.once('open', () => {

        console.log(`We're connected to ${url}`);
    });
};
