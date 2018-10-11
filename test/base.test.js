'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('Deployment', () => {

    it('empty path.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: '/'
        });

        expect(response.statusCode).to.equal(400);
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
});
