'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');
const JWT = require('jsonwebtoken');
const Faker = require('faker');
const { key, apiPrefix } = require('../src/utils/config');

const { describe, before, it } = exports.lab = Lab.script();
const { expect } = Code;

const Mongoose = require('mongoose');
const User = require('../src/models/user');

const requestSignup = {
    method: 'POST',
    url: `${apiPrefix}/signup`,
    payload: {}
};

const dummyUser = {
    username: Faker.internet.userName(),
    password: Faker.internet.password()
};

describe('Signing up | create account.', () => {

    before(async () => {

        await User.deleteMany({}).exec();
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

        const { username, password } = dummyUser;
        const request = Object.assign({}, requestSignup, {
            payload: {
                username,
                password: password.slice(0, 2)
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
        const token = JWT.verify(response.result.jwt, key);
        expect(Mongoose.Types.ObjectId.isValid(token._id)).to.be.true();
        expect(token.username).to.equal(username);
        expect(response.statusCode).to.equal(200);
    });

});
