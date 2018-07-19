var Funcmatic = require('@funcmatic/funcmatic')
var SentryPlugin = require('../lib/sentry')

var handler = Funcmatic.wrap(async (event, context, { sentry }) => {
  try {
    if (event.queryStringParameters.throwError) {
      throw new Error(event.queryStringParameters.throwError)
    }
    return {
      statusCode: 200
    }
  } catch (err) {
    // headers, method, host, protocol, url, query, cookies, body, ip and user
    await sentry.captureException(err, { req: { 
      body: "Hello World",
      headers: {
        "X-Funcmatic-Test": 'true'
      },
      query: "w=blah&q=blahblah",
      url: "/hello/world"
    }, event, user: {
      sub: "USER-SUB",
      email: "danieljyoo@gmail.com"
    } })
    return {
      statusCode: 500,
      body: err.message
    }
  }
})

describe('Request', () => {
  beforeEach(() => {
    Funcmatic.clear()
  })
  it ('should set a sentry.captureException service', async () => {
    Funcmatic.use(SentryPlugin, { dsn: process.env.SENTRY_DSN })
    var event = { queryStringParameters: { throwError: 'Error in user function' } }
    var context = { }
    var ret = await handler(event, context)
    console.log("RET", ret)
  })
}) 