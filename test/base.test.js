'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('Deployment.', () => {

    it('Route does not exist. | 400 => Bad request.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: '/'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        expect(response.result.message).to.equal('route does not exist');
    });
});
