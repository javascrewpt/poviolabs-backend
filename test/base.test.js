'use strict';

const Code = require('code');
const Lab = require('lab');
const Server = require('../server');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;
const { apiPrefix } = require('../src/utils/config');

describe('Deployment.', () => {

    it('Route does not exist. | Bad request => 400.', async () => {

        const response = await Server.inject({
            method: 'GET',
            url: `${apiPrefix}/`
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        expect(response.result.message).to.equal('route does not exist');
    });
});
