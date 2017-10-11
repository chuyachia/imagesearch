// TODO: verify url entry validaty and check for duplicated before adding to database
var express = require('express');
var app = express();
var mongodb = require('mongodb').MongoClient;
var url = require('url');

app.use(express.static('public'));
var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;


app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.get('/new/*',function(req,res){ 
  var new_ent = {}
  new_ent['url']  = req.params[0];
  if (!url.parse(new_ent['url']).host) {
    res.send('Not a valid URL');
  } else{
       mongodb.connect(uri,function(err,db){
        if (err) throw err;
        console.log('connected to database');
        var collect= db.collection('url_shortener');
         collect.findOne({url:new_ent['url']},function(err,result){
           if (err) throw err;
           if (result) {
            var shortened = { "original_url":result.url, "short_url":"https://urlshortener-chuya.glitch.me/"+result.shortnum};
            res.send(JSON.stringify(shortened));
             db.close();
           } else {
            collect.count({}, function(err, n){
           new_ent['shortnum'] = n+1;
             collect.insert(new_ent,function(err,result){
            if (err) throw err;
            console.log('new entry added to database');
            var shortened = { "original_url":new_ent['url'], "short_url":"https://urlshortener-chuya.glitch.me/"+new_ent['shortnum']};
            res.send(JSON.stringify(shortened));
            db.close();
          })
           }) 
           }
         })

      })      
  }   
})

app.get(/\/(\d+)/,function(req,res){
  mongodb.connect(uri,function(err,db){
    if (err) throw err;
    console.log('connected to database');
    var query = { shortnum: Number(req.params[0])};
    var collect= db.collection('url_shortener');
    collect.findOne(query,function(err,result){
      if (err) throw err;
      res.redirect(result.url);
      db.close();
    })
  })
})

/**/
var listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
