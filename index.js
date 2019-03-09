const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const Parser = require('./lib/parser')

const DEFAULT_ENCODING = 'utf8'
const DEFAULT_IGNORED_VISIBILITIES = [ 'protected', 'private' ]

function loadSourceFromFileContent (filecontent) {
  const $ = cheerio.load(filecontent)

  return {
    template: $('template').html(),
    script: $('script').html()
  }
}

module.exports.parseOptions = (options) => {
  if (!options || (!options.filename && !options.filecontent)) {
    /* eslint-disable max-len */
    throw new Error('One of options.filename or options.filecontent is required')
  }

  if (!options.encoding) {
    options.encoding = DEFAULT_ENCODING
  }

  if (!options.ignoredVisibilities) {
    options.ignoredVisibilities = DEFAULT_IGNORED_VISIBILITIES
  }
}

module.exports.parse = (options) => new Promise((resolve) => {
  this.parseOptions(options)

  if (!options.source) {
    if (options.filename) {
      if (path.extname(options.filename) === '.js') {
        options.source = {
          template: '',
          script: fs.readFileSync(options.filename, options.encoding)
        }
      } else {
        options.source = loadSourceFromFileContent(
          fs.readFileSync(options.filename, options.encoding)
        )
      }
    } else {
      options.source = loadSourceFromFileContent(options.filecontent)
    }
  }

  const component = {}
  const parser = new Parser(options)

  parser.features.forEach((feature) => {
    switch (feature) {
      case 'name':
      case 'description':
        component[feature] = null

        parser.on(feature, (value) => {
          component[feature] = value
        })
        break

      case 'keywords':
        component[feature] = []

        parser.on(feature, (value) => {
          component[feature] = value
        })
        break

      default: {
        const eventName = Parser.getEventName(feature)

        component[feature] = []

        parser.on(eventName, (value) => component[feature].push(value))
      }
    }
  })

  parser.on('end', () => {
    parser.features.forEach((feature) => {
      if (component[feature] instanceof Array) {
        /* eslint-disable arrow-body-style */
        component[feature] = component[feature].filter((item) => {
          return !options.ignoredVisibilities.includes(item.visibility)
        })
      }
    })

    resolve(component)
  })

  parser.walk()
})
