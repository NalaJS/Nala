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
  const {query, variables = {}} = req.body;
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
  //console.log('server.js 27: received post');
  graphQLHandler(req,res);
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000.");
});

module.exports = app;
