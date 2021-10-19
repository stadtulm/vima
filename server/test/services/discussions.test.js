const assert = require('assert');
const app = require('../../src/app');

describe('\'discussions\' service', () => {
  it('registered the service', () => {
    const service = app.service('discussions');

    assert.ok(service, 'Registered the service');
  });
});
