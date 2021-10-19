const assert = require('assert');
const app = require('../../src/app');

describe('\'discussion-messages\' service', () => {
  it('registered the service', () => {
    const service = app.service('discussion-messages');

    assert.ok(service, 'Registered the service');
  });
});
