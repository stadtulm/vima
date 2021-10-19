const assert = require('assert');
const app = require('../../src/app');

describe('\'sendstats\' service', () => {
  it('registered the service', () => {
    const service = app.service('sendstats');

    assert.ok(service, 'Registered the service');
  });
});
