require('dotenv').config()
var funcmatic = require('@funcmatic/funcmatic')
var SentryPlugin = require('../lib/sentry')

funcmatic.use(SentryPlugin, {
  dsn: process.env.SENTRY_DSN
})

describe('Request', () => {
  plugin = null
  beforeEach(() => {
    funcmatic = funcmatic.clone()
    plugin = funcmatic.getPlugin('sentry')
  })
  it ('should set a sentry service for manual logging of exceptions', async () => {
    var event = { httpMethod: 'GET' }
    var context = { coldstart: true }
    var ret = await funcmatic.invoke(event, context, async (event, context, { sentry }) => {
      expect(sentry).toBeTruthy()
      var eventId = await sentry.captureException(new Error("user manually invoked captureException with errorContext"), {
        event, 
        context
      })
      expect(eventId).toBeTruthy()
      return { eventId }
    })
  })
  it ('should automatically log exception for uncaught error', async () => {
    var event = { httpMethod: 'GET' }
    var context = { coldstart: true }
    try {
      var ret = await funcmatic.invoke(event, context, async (event, context, { sentry }) => {
        throw new Error("Uncaught user exception")
      })
    } catch (err) { }
    expect(plugin.lastCapture).toBeTruthy()
    expect(plugin.lastCapture).toMatchObject({
      success: true,
      capture: {
        eventId: expect.anything(),
        err: new Error("Uncaught user exception"),
        errContext: { event, context }
      }
    })
  })
}) 