var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var child = require('child_process');
var app = express();

app.use(bodyParser.json());

app.post('/api/ryu-manager/run', function(req, res) {
  var bodyString = req.body.app;

  if (!bodyString) {
    return res.sendStatus(400);
  }

  if (bodyString.indexOf('&') > -1 || bodyString.indexOf(';') > -1 || bodyString.indexOf('|') > -1) {
    return res.sendStatus(400);
  }

  var appList = bodyString.split(' ');
  var pidOptions = ['--pid-file', 'ryuPID'];
  var ryuOptions =  appList.concat(pidOptions);

  console.log(ryuOptions);
  var ryuProcess = child.spawn('./bin/ryu-manager', ryuOptions, {
    detached: true,
  });

  ryuProcess.stdout.setEncoding('utf8');

  ryuProcess.stdout.on('data', function(data) {
    console.log(data);
  });

  ryuProcess.stderr.on('data', function(data) {
    console.log('[x] Error: ' + data);
  });

  res.send({result: 'ok'});
});

app.get('/api/ryu-manager/stop', function(req, res) {
  if (fs.existsSync('ryuPID')) {
    process.kill(Number(fs.readFileSync('ryuPID')), 'SIGHUP');
    return res.sendStatus(204);
  } else {
    return res.sendStatus(400);
  }
});

var server = app.listen(1999, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('[*] Ryu Remote Server listening at http://%s:%s', host, port);
});
