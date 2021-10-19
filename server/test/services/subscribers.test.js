const assert = require('assert');
const app = require('../../src/app');

describe('\'subscribers\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscribers');

    assert.ok(service, 'Registered the service');
  });
});
