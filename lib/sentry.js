var Raven = require('raven')

class SentryPlugin {
  
  constructor() {
    this.name = 'sentry'
  }
  
  async start(conf) {
    this.conf = conf
    this.name == conf.name || this.name
    return Raven.config(conf.dsn, conf.options || { }).install()
  }
  
  async request(event, context) {
    context[this.name] = {
      'captureException': this.captureException
    }
    return { event, context }
  }
  
  async captureException(e, errContext) {
    errContext = errContext || { }
    return new Promise((resolve, reject) => {
      Raven.captureException(e, errContext, function(err, eventId) {
        if (err) reject(err)
        resolve(eventId)
      })
    })
  }
  
  async response(event, context, res) {
    if (!res) return res
    if (res.statusCode && res.statusCode >= 500) {
      // throw an error to Raven
    }
    return res
  }
}


// https://docs.sentry.io/clients/node/config/
async function ravenInstall(conf) {

}

// Raven.config(this.conf.dsn).install(function (err, initialErr, eventId) {
//   console.error(err);
//   process.exit(1);
// });


module.exports = new SentryPlugin()