
var express = require('express');
var app = express();
var https = require('https');
var querystring = require('querystring');
var mongodb = require('mongodb').MongoClient;


function performGet(endpoint, data,success,express_res) {
  var dataString = JSON.stringify(data);
  var headers = {};
  endpoint += '?' + querystring.stringify(data);
  
  var options = {
    host: "www.googleapis.com",
    path: endpoint,
    method: "GET",
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');
    
    var responseString = '';
    
    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      var responseObject = JSON.parse(responseString);
      success(responseObject,express_res);
    });
  });

  req.write(dataString);
  req.end();
}


function addtoDB(term,time) {
  var entry = {};
  entry.term = term;
  entry.when = time;
  var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;
  mongodb.connect(uri,function(err,db){
    if (err) throw err;
    var collect= db.collection('image_search');

    collect.insert(entry,function(err,result){
    if (err) throw err;
     db.close(); 
  })   
  })
}

app.use(express.static('public'));

app.get('/',function(req,res){
  res.sendFile(__dirname+ '/views/index.html');
})

app.get('/api/imagesearch/:term',function(req,res){
  var getParams = {
    key:process.env.KEY,
    cx:process.env.ID,
    q:'',
    searchType: 'image',
    startPage:1
  }
  getParams.q = req.params.term;
  if (req.query.offset) {
    getParams.startPage=req.query.offset;
  }
  performGet('/customsearch/v1', getParams,callbackfunc,res); 
  addtoDB(getParams.q,new Date(Date.now()).toISOString()) // convert date to ISO string before inserting to db
})


app.get('/api/latest/imagesearch',function(req,res){
  var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB; 
    mongodb.connect(uri,function(err,db){
    if (err) throw err;
    console.log('connected to database');
    var collect= db.collection('image_search');
    collect.find({}).sort({when:-1}).toArray(function(err,result){
      if (err) throw err;
      result= result.map(function(x){return {term: x.term,when:x.when}});
      res.send(result.slice(0,10));
    })
  })
  
})

var callbackfunc = function(data,res) {
  var returnList=[];
  for (var result in data.items) {    
    var returnObj= {}
    returnObj.url = data.items[result].link;
    returnObj.snippet= data.items[result].snippet;
    returnObj.thumbnail = data.items[result].image.thumbnailLink;
    returnObj.context = data.items[result].image.contextLink;
    returnList.push(returnObj);
  }
  res.send(returnList);
}
 


var listener = app.listen('3000', function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
