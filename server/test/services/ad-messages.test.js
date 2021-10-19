const assert = require('assert');
const app = require('../../src/app');

describe('\'ad-messages\' service', () => {
  it('registered the service', () => {
    const service = app.service('ad-messages');

    assert.ok(service, 'Registered the service');
  });
});
