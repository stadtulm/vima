const assert = require('assert');
const app = require('../../src/app');

describe('\'organisations\' service', () => {
  it('registered the service', () => {
    const service = app.service('organisations');

    assert.ok(service, 'Registered the service');
  });
});
