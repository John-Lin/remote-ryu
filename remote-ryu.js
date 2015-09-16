var express = require('express');
var bodyParser = require('body-parser');
var child = require('child_process');
var app = express();

app.use(bodyParser.json());

app.post('/api/ryu-manager/run', function(req, res) {
  var bodyString = req.body.app;

  if (bodyString.indexOf('&') > -1 || bodyString.indexOf(';') > -1 || bodyString.indexOf('|') > -1) {
    return res.sendStatus(400);
  }

  var appList = bodyString.split(' ');
  var pidOptions = ['--pid-file', 'ryuPID'];
  var ryuOptions =  appList.concat(pidOptions);

  console.log(ryuOptions);
  var ryuProcess = child.spawn('./bin/ryu-manager', ryuOptions);

  res.send({result: 'ok'});
});

app.get('/api/ryu-manager/stop', function(req, res) {
  child.exec('kill -9 $(<"./ryuPID")', function(err, stdout, stderr) {
    console.log(stdout);
  });

  return res.sendStatus(204);
});

var server = app.listen(1999, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('[*] Ryu-Remote-Server listening at http://%s:%s', host, port);
});
