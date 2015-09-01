//var express = require('express');
import express from 'express';
import {graphql} from 'graphql';
import Schema from './schema.js';
import bodyParser from 'body-parser'

let app = express();


app.use(express.static('client'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

async function graphQLHandler(req, res){
  //console.log('before:'+req.body);
  console.log('a req.body.query: '+ req.body.query);
  console.log('a req.body.variables: '+req.body.variables);
  const {query, variables = {}} = req.body;
  console.log('b query: '+ query);
  console.log('b req.body.variables: '+req.body.variables);
  //console.log('after'+req.body);
  const result = await graphql(
    Schema,
    query,
    {db: req.db},
    variables
  );
  console.log('server.js: gqlhandler, result: ', result);
  return res(result);
}

app.post('/', (req,res)=>{
  console.log('server.js 27: received post');
  //console.log(req.body);
  graphQLHandler(req,res);
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000.");
});

module.exports = app;
