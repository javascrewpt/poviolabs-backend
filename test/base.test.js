'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');
const JWT = require('jsonwebtoken');
const { key } = require('../src/utils/config');

const { describe, before, it } = exports.lab = Lab.script();
const { expect } = Code;

const Mongoose = require('mongoose');
const User = require('../src/models/user');

const requestSignup = {
    method: 'POST',
    url: '/signup',
    payload: {}
};

const requestLogin = {
    method: 'POST',
    url: '/login',
    payload: {}
};

const dummyUser = {
    username: 'JohnDoe',
    password: 'J0hnD03'
};

describe('Deployment.', () => {

    before(async () => {

        await User.deleteMany({}).exec();
    });

    it('Route does not exist. | 400 => Bad request.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: '/'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        expect(response.result.message).to.equal('route does not exist');
    });

    it('List users in a most liked to least liked.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: '/most-liked'
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.users).to.length(0);
    });

    it('Sign up to the system (username, password). | empty payload => 400 Bad Request', async () => {

        const request = Object.assign({}, requestSignup, {
            payload: {}
        });

        const response = await Server.inject(request);
        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        expect(response.result.message).to.equal('Invalid request payload input');
    });

    it('Sign up to the system (username, password). | password too short => 400 Bad Request', async () => {

        const { username } = dummyUser;
        const request = Object.assign({}, requestSignup, {
            payload: {
                username,
                password: 'JD'
            }
        });

        const response = await Server.inject(request);
        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        expect(response.result.message).to.equal('Invalid request payload input');
    });

    it('Sign up to the system (username, password). | successful, returns token => 200', async () => {

        const { username, password } = dummyUser;

        const request = Object.assign({}, requestSignup, {
            payload: {
                username,
                password
            }
        });

        const response = await Server.inject(request);
        const token = JWT.verify(response.result, key);
        expect(Mongoose.Types.ObjectId.isValid(token._id)).to.be.true();
        expect(token.username).to.equal(username);
        expect(response.statusCode).to.equal(200);
    });

    it('Logs in an existing user with a password. | wrong username => 400', async () => {

        const { password } = dummyUser;

        const request = Object.assign({}, requestLogin, {
            payload: {
                username: 'WrongUsername',
                password
            }
        });

        const response = await Server.inject(request);
        expect(response.result.message).to.equal('Username does not exist!');
        expect(response.statusCode).to.equal(400);
    });

    it('Logs in an existing user with a password. | wrong password => 400', async () => {

        const { username } = dummyUser;

        const request = Object.assign({}, requestLogin, {
            payload: {
                username,
                password: 'WrongPassword'
            }
        });

        const response = await Server.inject(request);
        expect(response.result.message).to.equal('Wrong password!');
        expect(response.statusCode).to.equal(400);
    });

    it('Logs in an existing user with a password. | successful => 200', async () => {

        const { username, password } = dummyUser;

        const request = Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        });

        const response = await Server.inject(request);
        const token = JWT.verify(response.result, key);
        expect(Mongoose.Types.ObjectId.isValid(token._id)).to.be.true();
        expect(token.username).to.equal(username);
        expect(response.statusCode).to.equal(200);
    });

});
