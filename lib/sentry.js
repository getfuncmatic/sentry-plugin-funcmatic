var Raven = require('raven')

class SentryPlugin {
  
  constructor() {
    this.name = 'sentry'
    // we track the most recent 
    // error logged for testing purposes
    this.lastCapture = null
  }
  
  async start(conf, env) {
    this.name == conf.name || this.name
    this.dsn = conf.dsn || env.SENTRY_DSN
    this.options = conf.options || { }
    return Raven.config(this.dsn, this.options).install()
  }
  
  async request(event, context) {
    var service = {
      'captureException': this.captureException.bind(this)
    }
    return { service }
  }
  
  async captureException(e, errContext) {
    errContext = errContext || { }
    return new Promise((resolve, reject) => {
      Raven.captureException(e, { extra: errContext }, (err, eventId) => {
        if (err) {
          this.lastCapture = {
            error: true,
            err
          }
          reject(err)
        }
        this.lastCapture = {
          success: true,
          capture: {
            eventId,
            err: e, 
            errContext
          }
        }
        resolve(eventId)
      })
    })
  }
  
  async response(event, context, res) {
    if (!res) return res
    if (res.statusCode && res.statusCode >= 500) {
      // throw an error to Raven?
    }
    return res
  }

  async error(err, event, context, res) {
    return await this.captureException(err, { event, context })
  }
}

module.exports = SentryPlugin