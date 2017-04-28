'use strict'

const parser = require('..')
const assert = require('assert')
const path = require('path')

const f = (filename) => path.join(__dirname, 'fixtures/' + filename)

const options = {
  filename: f('checkbox.vue'),
  encoding: 'utf8',
  ignoredVisibilities: []
}

/* global describe it */

describe('options', () => {
  it('should faild to parse with missing options.filename', (done) => {
    parser.parse({})
      .catch((err) => {
        assert.ok(/required/.test(err.message))
        done()
      })
  })

  it('should parse with default options.encoding', (done) => {
    const _options = {}

    Object.assign(_options, options)

    delete _options.encoding

    parser.parse(_options)
      .then(() => done())
      .catch(done)
  })

  it('should faild with missing options.filename', (done) => {
    parser.parse({})
      .catch((err) => {
        assert.ok(/required/.test(err.message))
        done()
      })
  })
})

describe('component', () => {
  let component = {}

  it('should parse without error', (done) => {
    parser.parse(options)
      .then((_component) => {
        component = _component
        done()
      })
      .catch(done)
  })

  it('should have a name', () =>
    assert.equal(component.name, 'checkbox'))

  it('should guest the component name using the filename', (done) => {
    parser.parse({ filename: f('UnNamedInput.vue') })
      .then((component) => {
        assert.equal(component.name, 'un-named-input')
        done()
      })
      .catch(done)
  })

  it('should have a description', () =>
    assert.equal(component.description, 'A simple checkbox component'))
})

describe('component.props', () => {
  let component = {}

  parser.parse(options)
    .then((_component) => (component = _component))
    .catch((err) => { throw err })

  it('should contain a v-model prop with a description', () => {
    const item = component.props.find((item) => item.name === 'v-model')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.value.type, 'Array')
    assert.equal(item.value.required, true)
    assert.equal(item.value.twoWay, true)
    assert.equal(item.description, 'The checkbox model')
  })

  it('should contain a disabled prop with comments', () => {
    const item = component.props.find((item) => item.name === 'disabled')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.value, 'Boolean')
    assert.equal(item.description, 'Initial checkbox state')
  })

  it('should contain a checked prop with default value and comments', () => {
    const item = component.props.find((item) => item.name === 'checked')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.value.type, 'Boolean')
    assert.equal(item.value.default, true)
    assert.equal(item.description, 'Initial checkbox value')
  })

  it('should contain a checked prop with camel name', () => {
    const item = component.props.find((item) => item.name === 'prop-with-camel')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.value.type, 'Object')
    assert.equal(item.value.default.type, 'ArrowFunctionExpression')
    assert.equal(item.description, 'Prop with camel name')
  })
})

describe('component.slots', () => {
  let component = {}

  parser.parse(options)
    .then((_component) => (component = _component))
    .catch((err) => { throw err })

  it('should contain a default slot', () => {
    const item = component.slots.find((item) =>
      item.hasOwnProperty('name') && item.name === 'default')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Default slot')
  })

  it('should contain a named slot', () => {
    const item = component.slots.find((item) =>
      item.hasOwnProperty('name') && item.name === 'label')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Use this slot to set the checkbox label')
  })

  it('should contain a named slot with multiline description', () => {
    const item = component.slots.find((item) =>
      item.hasOwnProperty('name') && item.name === 'multiline')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'This\n    is multiline description')
  })

  it('should contain a named slot without description', () => {
    const item = component.slots.find(
      (item) => item.name === 'undescribed')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, null)
  })
})

describe('component.events', () => {
  let component = {}

  parser.parse(options)
    .then((_component) => (component = _component))
    .catch((err) => { throw err })

  it('should contain event with literal name', () => {
    const item = component.events.find((item) => item.name === 'loaded')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Emit when the component has been loaded')
  })

  it('should contain event with identifier name', () => {
    const item = component.events.find((item) => item.name === 'check')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Event with identifier name')
  })

  it('should contain event with renamed identifier name', () => {
    const item = component.events.find((item) => item.name === 'renamed')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Event with renamed identifier name')
  })

  it('should contain event with recursive identifier name', () => {
    const item = component.events.find((item) => item.name === 'recursive')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Event with recursive identifier name')
  })
})

describe('component.methods', () => {
  let component = {}

  parser.parse(options)
    .then((_component) => (component = _component))
    .catch((err) => {
      throw err
    })

  it('should contain a method', () => {
    const item = component.methods.find(
      (item) => item.name === 'check')

    assert.notEqual(typeof item, 'undefined')
    assert.equal(item.description, 'Check the checkbox')
  })

  it('should contain a protected method', () => {
    const item = component.methods.find(
      (item) => item.visibility === 'protected')

    assert.notEqual(typeof item, 'undefined')
  })

  it('should contain a private method', () => {
    const item = component.methods.find(
      (item) => item.visibility === 'private')

    assert.notEqual(typeof item, 'undefined')
  })

  it('should contain un uncommented method', () => {
    const item = component.methods.find(
      (item) => item.description === null)

    assert.notEqual(typeof item, 'undefined')
  })
})
