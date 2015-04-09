var fs = require('fs')
var os = require('os')
var path = require('path')
var bytes = require('bytes')

// stupid node
var tmp = (os.tmpdir || os.tmpDir)()

module.exports = function (stream, destination, options, done) {
  if (typeof options === 'function') {
    // [stream, destination, done]
    done = options
    options = {}
  }

  if (typeof destination === 'object') {
    // [stream, options, [done]]
    options = destination
    destination = options.destination
  }

  if (!options)
    options = {}

  if (typeof destination !== 'string')
    throw new TypeError('Destination must be a string')

  if (!destination)
    throw new Error('Destination must be defined.')

  // convert the limit to an integer
  var limit = null
  if (typeof options.limit === 'number')
    limit = options.limit
  if (typeof options.limit === 'string')
    limit = bytes(options.limit)

  // convert the expected length to an integer
  var length = null
  if (!isNaN(options.length))
    length = parseInt(options.length, 10)

  // check the length and limit options.
  // note: we intentionally leave the stream paused,
  // so users should handle the stream themselves.
  if (limit !== null && length !== null && length > limit) {
    if (typeof stream.pause === 'function')
      stream.pause()

    process.nextTick(function () {
      var err = makeError('request entity too large', 'entity.too.large')
      err.status = err.statusCode = 413
      err.length = err.expected = length
      err.limit = limit
      done(err)
    })
    return defer
  }

  var state = stream._readableState
  // streams2+: assert the stream encoding is buffer.
  if (state && state.encoding != null) {
    if (typeof stream.pause === 'function')
      stream.pause()

    process.nextTick(function () {
      var err = makeError('stream encoding should not be set',
        'stream.encoding.set')
      // developer error
      err.status = err.statusCode = 500
      done(err)
    })
    return defer
  }

  var temporaryDestination = path.join(tmp, uid())
  var writeStream = stream.pipe(fs.createWriteStream(temporaryDestination))

  var received = 0
  if (length !== null || limit !== null)
    stream.on('data', onData)
  if (length !== null)
    stream.once('end', onEnd)

  stream.once('close', onClose)
  stream.once('error', onFinish)
  writeStream.once('error', onFinish)
  // shouldn't ever emit 'close' without `finish`.
  writeStream.once('close', onFinish)

  return defer

  function defer(fn) {
    done = fn
  }

  function onData(chunk) {
    received += chunk.length

    if (limit !== null && received > limit) {
      var err = makeError('request entity too large', 'entity.too.large')
      err.status = err.statusCode = 413
      err.received = received
      err.limit = limit
      onFinish(err)
    }
  }

  // If a 'close' event is emitted before the
  // readable stream has ended,
  // then we assume that it was prematurely closed
  // and we cleanup the file appropriately.
  function onClose() {
    if (state && !state.ended)
      cleanup(true)
  }

  function onEnd() {
    if (received !== length) {
      var err = makeError('request size did not match content length',
        'request.size.invalid')
      err.status = err.statusCode = 400
      err.received = received
      err.length = err.expected = length
      onFinish(err)
    }
  }

  function onFinish(err) {
    if (err)
      finish(err)
    else
      fs.rename(temporaryDestination, destination, finish)
  }

  function finish(err) {
    cleanup(err)
    done(err, destination)
  }

  function cleanup(err) {
    if (err) {
      writeStream.destroy()
      fs.unlink(temporaryDestination, noop)
    }

    stream.removeListener('data', onData)
    stream.removeListener('end', onEnd)
    stream.removeListener('close', onClose)
    stream.removeListener('error', onFinish)
    writeStream.removeListener('error', onFinish)
    writeStream.removeListener('close', onFinish)

    stream = writeStream = null
  }
}

function uid() {
  return Math.random().toString(36).slice(2)
}

function noop() {}

// to create serializable errors you must re-set message so
// that it is enumerable and you must re configure the type
// property so that is writable and enumerable
function makeError(message, type) {
  var error = new Error()
  error.message = message
  Object.defineProperty(error, 'type', {
    value: type,
    enumerable: true,
    writable: true,
    configurable: true
  })
  return error
}