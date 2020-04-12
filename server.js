// run node -r esm server.js
var express = require('express');
var app = express();
var path = require('path');

app.use("/static", express.static("./static"));
app.use("/node_modules", express.static('./node_modules'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/'));
});

app.listen(3000);