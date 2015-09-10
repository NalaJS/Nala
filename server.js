import express from 'express';
import {graphql} from 'graphql';
import Schema from './data/schema.js';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';


let app = express();

app.use(express.static('client'));
app.use(bodyParser.urlencoded());

async function graphQLHandler(req, res, schema){
  const {query, variables = {}} = req.body;
  console.log(query);
  console.log(variables);
  const result = await graphql(
    schema,
    query,
    {},
    variables
  );
  res.send(result);
}

// app.post('/', graphQLHandler);

// var Sandal = require('sandle');
var cb = Sandal(Schema, 'postgres://localhost/test'); // => function(req, res) { }
app.post('/',cb);

function Sandal(query, mutation, uri) {
  var sequelize = new Sequelize(uri);
  console.log(schema);
  schema.query.fields.getUser.resolve = (root, {name})=>{
    return User
      .findOne({
        where: { name : name }
      })
  }

  return function(req, res) {
    graphQLHandler(req, res, schema);
  }
}

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening on port 3000.");
  //sequelize = new Sequelize('postgres://localhost/test');
});

module.exports = app;
//module.exports.sequelize = sequelize;
