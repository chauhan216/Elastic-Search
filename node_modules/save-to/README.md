# Save to ______ [![Build Status](https://travis-ci.org/stream-utils/save-to.png)](https://travis-ci.org/stream-utils/save-to)

Save a stream to a file.

## API

```js
var saveTo = require('save-to')
var stream = fs.createReadStream('some file.txt')

saveTo(stream, 'destination.txt', function (err, destination) {
  if (err) throw err
})
```

## saveTo(stream [, destination] [, options], callback)

- `stream` is the source stream, for example a request.
- `destination` is the path where the stream will be saved.
- `callback(err, destination)`

The options are:

- `destination` - if you don't specify destination as an argument.
- `length` - expected byte length. Throws an error if it does not match the stream's length.
- `limit` - maximum byte length. Throws an error if the stream is larger than this size.
