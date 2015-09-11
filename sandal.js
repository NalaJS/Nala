import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql} from 'graphql';

let app = express();

console.log('Sandal is running');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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

function Sandal(schema,uri){//query, mutation, uri) {

  // eventually parse uri for different dbs
  var sequelize = new Sequelize(uri);

  // todo: generate sequelize schema based on provided schema
  let User = sequelize.define('users', {
    name: {
      type: Sequelize.STRING,
      field: 'name'
    },
    age: {
      type: Sequelize.INTEGER,
      field: 'age'
    },
  });

  // todo: make relations work
  User.belongsToMany(User, {as: 'friends', through: 'friendships'});
  sequelize.sync();

  schema._schemaConfig.query._fields.getUser.resolve = (root, {name})=>{
    return User
      .findOne({
        where: { name : name }
      })
  }
  // for (var key in schema._typeMap) {
  //   console.log('Key is: ', key);
  // }
  //TODO: find better name
  var GraphQLModels = Object.keys(schema._typeMap).filter(function(elem) {
    return elem !== 'String' && elem !== 'query' && elem !== 'Int' && elem !== 'mutation' && elem !== 'Boolean' && (elem[0] !== '_' || elem[1] !== '_');
  });

  console.log(schema._typeMap[GraphQLModels[0]]);
  // { name: 'user',
  //   description: 'this is the user type',
  //   isTypeOf: undefined,
  //   _typeConfig:
  //    { name: 'user',
  //      description: 'this is the user type',
  //      fields: { name: [Object], age: [Object] } },
  //   _interfaces: [],
  //   _fields:
  //    { name: { type: [Object], name: 'name', args: [] },
  //      age: { type: [Object], name: 'age', args: [] } } }

  // console.dir(schema._typeMap);//._schemaConfig);//.mutation._fields);
  return function(req, res) {
    console.log('pre graphqlhandler');
    console.log('req body in Callback ',req.body);
    graphQLHandler(req, res, schema);
  }
}

// for(let i = 0; i < GraphQLModels.length; i++){
//
// }
module.exports = Sandal;
