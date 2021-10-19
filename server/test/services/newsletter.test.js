const assert = require('assert');
const app = require('../../src/app');

describe('\'newsletter\' service', () => {
  it('registered the service', () => {
    const service = app.service('newsletter');

    assert.ok(service, 'Registered the service');
  });
});
