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

const requestLogin = {
    method: 'POST',
    url: `${apiPrefix}/login`,
    payload: {}
};

const dummyUser = {
    username: Faker.internet.userName(),
    password: Faker.internet.password()
};
let newPassword = null;

describe('Logins.', () => {

    before(async () => {

        await User.deleteMany({}).exec();
        const { username, password } = dummyUser;

        const request = Object.assign({}, requestSignup, {
            payload: {
                username,
                password
            }
        });
        await Server.inject(request);
    });

    it('Logs in an existing user with a password. | wrong username => 400', async () => {

        const { password } = dummyUser;

        const request = Object.assign({}, requestLogin, {
            payload: {
                username: Faker.internet.userName(),
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
                password: Faker.internet.password()
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
        const token = JWT.verify(response.result.jwt, key);
        expect(Mongoose.Types.ObjectId.isValid(token._id)).to.be.true();
        expect(token.username).to.equal(username);
        expect(response.statusCode).to.equal(200);
    });

    it('Get the currently logged in user information. | successful => 200', async () => {

        const { username, password } = dummyUser;

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/me`,
            headers: {
                'Authorization': token
            }
        });

        expect(Mongoose.Types.ObjectId.isValid(response.result._id)).to.be.true();
        expect(response.result.username).to.equal(username);
        expect(response.statusCode).to.equal(200);
    });

    it('Change password. | successful => 200', async () => {

        const { username, password } = dummyUser;
        newPassword = Faker.internet.password();

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'POST',
            url: `${apiPrefix}/update-password`,
            headers: {
                'Authorization': token
            },
            payload: {
                oldPassword: password,
                newPassword
            }
        });

        expect(response.result.success).to.be.true();
        expect(response.statusCode).to.equal(200);
    });


    it('Change password. | Failure, wrong existing username => 400', async () => {

        const { username } = dummyUser;
        const password = Faker.internet.password();

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password: newPassword
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'POST',
            url: `${apiPrefix}/update-password`,
            headers: {
                'Authorization': token
            },
            payload: {
                oldPassword: password,
                newPassword: password
            }
        });

        expect(response.result.message).to.equal('Existing password is not correct!');
        expect(response.statusCode).to.equal(400);
    });

});
