require('./check-versions')()
var config = require('../config')
if (!process.env.NODE_ENV) process.env.NODE_ENV = JSON.parse(config.build.env.NODE_ENV)
var path = require('path')
var express = require('express')
var app = express()

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.build.port

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve built files
app.use(express.static(config.build.assetsRoot))

module.exports = app.listen(port, function(err) {
  if (err) {
    console.log(err)
    return
  }
  var uri = 'http://localhost:' + port
  console.log('Listening at ' + uri + '\n')
})
