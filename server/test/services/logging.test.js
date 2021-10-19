const assert = require('assert')
const app = require('../../src/app')

describe('\'logging\' service', () => {
  it('registered the service', () => {
    const service = app.service('logging')

    assert.ok(service, 'Registered the service')
  })
})
