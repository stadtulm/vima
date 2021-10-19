const assert = require('assert')
const app = require('../../src/app')

describe('\'status-container-helper\' service', () => {
  it('registered the service', () => {
    const service = app.service('status-container-helper')

    assert.ok(service, 'Registered the service')
  })
})
