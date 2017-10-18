'use strict';

const querystring = require('querystring'),
      https = require('https');

function searchHandle(db) {
  var collect= db.collection('image_search');

  this.getpastsearch= function(req,res){
      collect.find({}).sort({when:-1}).toArray(
        function(err,result){
          if (err) throw err;
          result= result.map(function(x){return {term: x.term,when:x.when}});
          res.send(result.slice(0,10));
    })
  };
  
  this.addsearch= function(req,res){
    var entry = {};
    entry.term = req.params.term;
    entry.when = new Date(Date.now()).toISOString();
    collect.insert(entry,function(err,result){
      if (err) throw err;     
    });
    callapi(req,res);    
  };
  
  var callapi = function(req,res){ // a private function for addsearch method
    var getParams = {
      key:process.env.KEY,
      cx:process.env.ID,
      q:req.params.term,
      searchType: 'image',
      startPage:1
    }
    if (req.query.offset) {
      getParams.startPage=req.query.offset;
    }
    var dataString = JSON.stringify(getParams);
    
    var endpoint = '/customsearch/v1?' + querystring.stringify(getParams);

    var options = {
      host: "www.googleapis.com",
      path: endpoint,
      method: "GET",
    };
    
    var apireq = https.request(options, function(apires) {
      apires.setEncoding('utf-8');    
      var responseString = '';
    
      apires.on('data', function(data) {
        responseString += data;
      });

      apires.on('end', function() {
        var responseObject = JSON.parse(responseString);
        var returnList=[];
        for (var result in responseObject.items) {    
          var returnObj= {}
          returnObj.url = responseObject.items[result].link;
          returnObj.snippet= responseObject.items[result].snippet;
          returnObj.thumbnail = responseObject.items[result].image.thumbnailLink;
          returnObj.context = responseObject.items[result].image.contextLink;
          returnList.push(returnObj);
        }
        res.send(returnList);
      });
    });
    apireq.write(dataString);
    apireq.end();
    };  
}

module.exports = searchHandle;