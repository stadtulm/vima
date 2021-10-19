const assert = require('assert');
const app = require('../../src/app');

describe('\'sites\' service', () => {
  it('registered the service', () => {
    const service = app.service('sites');

    assert.ok(service, 'Registered the service');
  });
});
