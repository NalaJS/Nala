import express from 'express';
import {graphql} from 'graphql';
import Schema from './data/schema.js';
import bodyParser from 'body-parser';

let app = express();

app.use(express.static('client'));
app.use(bodyParser.urlencoded());

async function graphQLHandler(req, res){
  console.log('req.body!!',req.body);
  const {query, variables = {}} = req.body;
  console.log(query);
  console.log(variables);
  const result = await graphql(
    Schema,
    query,
    {},
    variables
  );
  //console.log('server.js: gqlhandler, result: ', result);
  res.send(result);
}

app.post('/', graphQLHandler);
// var sandle = require('sandle');
// var cv = sandle(Schema, uri); // => function(req, res) { }
// app.post('/',cv);

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000.");
  //sequelize = new Sequelize('postgres://localhost/test');
});

module.exports = app;
//module.exports.sequelize = sequelize;
