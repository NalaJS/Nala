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
/*  let User = sequelize.define('users', {
    name: {
      type: Sequelize.STRING,
      field: 'name'
    },
    age: {
      type: Sequelize.INTEGER,
      field: 'age'
    },
  });
*/

  // todo: make relations work


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
  var defaultNames = ['String', 'query', 'Int', 'mutation', 'Boolean'];
  var GraphQLModelNames = Object.keys(schema._typeMap).filter(function(elem) {
    return defaultNames.indexOf(elem) < 0 && (elem[0] !== '_' || elem[1] !== '_');
  });

var sequelizeSchemas = convertSchema(GraphQLModelNames, schema._typeMap);
//console.dir("sequelizeSchemas: " + Object.keys(sequelizeSchemas[0][1]));
var User = sequelize.define(sequelizeSchemas[0][0], sequelizeSchemas[0][1]); //expect: var User = obj; //var ourName = obj
User.belongsToMany(User, {as: 'friends', through: 'friendships'});
sequelize.sync();
//console.log("sqlize double os", User);
//console.log("model fields name type...  ", schema._typeMap[GraphQLModels[0]]._fields.age.type);
  // console.log(schema._typeMap[GraphQLModels[0]]);
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

//this function takes in the user created schema in GraphQLSchema object
//and converts it into Sequelize model definitions and subsequently runs them.

function convertSchema(modelNames, typeMap){
  var sequelizeArr = [];
  for(var i = 0; i < modelNames.length; i++) {
    var model = typeMap[modelNames[i]],
        fields = Object.keys(model._fields), //['name', 'age']
        sequelizeSchema = {},
        sequelizeFieldTypes = {String: Sequelize.STRING, Int: Sequelize.INTEGER};
    for(var j = 0; j < fields.length; j++) {
      sequelizeSchema[fields[j]] = {
        type: sequelizeFieldTypes[model._fields[fields[j]].type.name],
        field: fields[j]
      };
    }
    // console.log("sequeilize int", Sequelize.INTEGER);
    // console.log("sequelize schema", sequelizeSchema.age.type);
    // sequelizeArr.push(sequelize.define(modelNames[i], sequelizeSchema));
    sequelizeArr.push([modelNames[i], sequelizeSchema]);
  }
    return sequelizeArr;
  //
  //to be created:
  // let User = sequelize.define('users', {
  //   name: {
  //     type: Sequelize.STRING,
  //     field: 'name'
  //   },
  //   age: {
  //     type: Sequelize.INTEGER,
  //     field: 'age'
  //   },
  // });

  //we take in this...
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


}
// for(let i = 0; i < GraphQLModels.length; i++){
//
// }
module.exports = Sandal;
