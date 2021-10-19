const assert = require('assert');
const app = require('../../src/app');

describe('\'statistics\' service', () => {
  it('registered the service', () => {
    const service = app.service('statistics');

    assert.ok(service, 'Registered the service');
  });
});
