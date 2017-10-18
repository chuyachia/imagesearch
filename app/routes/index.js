'use strict';

var SearchHandle = require(process.cwd() + '/app/controllers/searchHandle.js');

module.exports = function (app,db) {
  var searchHandle = new SearchHandle(db);
  
  app.route('/').get(function(req,res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });
  
  app.route('/api/latest/imagesearch').get(searchHandle.getpastsearch);
  
  app.route('/api/imagesearch/:term').get(searchHandle.addsearch);
}