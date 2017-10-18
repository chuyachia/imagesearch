'use strict';

const express = require('express'),
      route = require('./app/routes/index.js'),
      app = express(),
      mongodb = require('mongodb').MongoClient;



mongodb.connect('mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB,
                function(err,db){
  if (err) {
    throw new Error('Fail to connect to database');
  } else {
    console.log('Connected to database');
  }
  app.use(express.static('public'));
  app.use(express.static('app/controllers'));
  
  route(app,db);
  
  var listener = app.listen('3000', function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });

})

