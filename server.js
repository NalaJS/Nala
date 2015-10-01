import express from 'express';
import {graphql} from 'graphql';
import Schema from './data/schema.js';
import bodyParser from 'body-parser';
var Nala = require('./sandal.js');

let app = express();

app.use(express.static('client'));
app.use(bodyParser.urlencoded());

var cb = Nala(Schema, 'postgres://localhost/test'); // => function(req, res) { }

app.post('/',cb);

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000.");
});

module.exports = app;
