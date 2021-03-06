'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');
const JWT = require('jsonwebtoken');
const Faker = require('faker');
const { key, apiPrefix } = require('../src/utils/config');

const { describe, before, it } = exports.lab = Lab.script();
const { expect } = Code;

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

const dummyUsers = [{
    username: Faker.internet.userName(),
    password: Faker.internet.password()
}, {
    username: Faker.internet.userName(),
    password: Faker.internet.password()
}, {
    username: Faker.internet.userName(),
    password: Faker.internet.password()
}, {
    username: 'PROvio',
    password: 'p0v10'
}];

const savedDummyUsers = [];

describe('Likes and unlikes.', () => {

    before(async () => {

        await User.deleteMany({}).exec();

        for (const user of dummyUsers) {
            const { username, password } = user;
            const request = Object.assign({}, requestSignup, {
                payload: {
                    username,
                    password
                }
            });
            const saved = await Server.inject(request);
            savedDummyUsers.push(JWT.verify(saved.result.jwt, key));
        }
    });

    it('List username & number of likes of a user. | Success => 200.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url:`${apiPrefix}/user/${savedDummyUsers[1]._id}`
        });

        expect(response.result.username).to.equal(savedDummyUsers[1].username);
        expect(response.statusCode).to.equal(200);
    });

    it('List username & number of likes of a user. | Failure, user doesn\t exist. => 400.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${Faker.internet.password()}`
        });

        expect(response.result.message).to.equal('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
        expect(response.statusCode).to.equal(400);

    });


    it('Like a user. | successful => 200', async () => {

        const { username, password } = dummyUsers[0];

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${savedDummyUsers[1]._id}/like`,
            headers: {
                'Authorization': token
            }
        });

        expect(response.result.didLike).to.be.true();
        expect(response.statusCode).to.equal(200);

    });

    it('Like a user. | failure, can\'t like twice => 400', async () => {

        const { username, password } = dummyUsers[0];

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${savedDummyUsers[1]._id}/like`,
            headers: {
                'Authorization': token
            }
        });

        expect(response.result.message).to.equal('Already liked the user!');
        expect(response.statusCode).to.equal(400);

    });

    it('Like a user. | failure, no token provided => 401', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${savedDummyUsers[1]._id}/like`
        });

        expect(response.statusCode).to.equal(401);

    });

    it('Like a user. | failure, trying to like yourself => 401', async () => {

        const { username, password } = dummyUsers[0];

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${JWT.verify(token, key)._id}/like`,
            headers: {
                'Authorization': token
            }
        });

        expect(response.statusCode).to.equal(400);
    });

    it('Unlike a user. | success => 200', async () => {

        const { username, password } = dummyUsers[0];

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${savedDummyUsers[1]._id}/unlike`,
            headers: {
                'Authorization': token
            }
        });

        expect(response.result.didLike).to.be.false();
        expect(response.statusCode).to.equal(200);
    });

    it('Unlike a user. | failure, not among the likes => 400', async () => {

        const { username, password } = dummyUsers[0];

        const token = (await Server.inject(Object.assign({}, requestLogin, {
            payload: {
                username,
                password
            }
        }))).result.jwt;

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/user/${savedDummyUsers[1]._id}/unlike`,
            headers: {
                'Authorization': token
            }
        });

        expect(response.result.message).to.equal('Not among the users that liked the person!');
        expect(response.statusCode).to.equal(400);

    });

});
