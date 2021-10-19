const assert = require('assert');
const app = require('../../src/app');

describe('\'violations\' service', () => {
  it('registered the service', () => {
    const service = app.service('violations');

    assert.ok(service, 'Registered the service');
  });
});
