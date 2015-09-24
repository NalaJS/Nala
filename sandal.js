import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql, GraphQLObjectType, GraphQLList} from 'graphql';
import createGetters from './lib/CreateGetters';
import createAdders from './lib/CreateAdders';
import createUpdaters from './lib/CreateUpdaters';
import createDestroyers from './lib/CreateDestroyers';

import util from 'util';

let app = express();
var tables = {}; //holds our sequelize tables
var relationsArray = [];

console.log('Sandal is running');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

async function graphQLHandler(req, res, schema){
  const {query, variables = {}} = req.body;
  const result = await graphql(
    schema,
    query,
    {},
    variables
  );
  res.send(result);
}

function Sandal(schema,uri){
  //TODO: eventually parse uri for different dbs
  var sequelize = new Sequelize(uri);
  var QUERY_FIELDS = schema._schemaConfig.query._fields;
  var MUTATION_FIELDS = schema._schemaConfig.mutation._fields;

  //extract user defined GraphQL schemas that we want to convert into sequelize schemas
  //we filter out the non-user defined ones by comparing them to defaultNames
  var defaultNames = ['String', 'query', 'Int', 'mutation', 'Boolean'];
  var GraphQLModelNames = Object.keys(schema._typeMap).filter(function(elem) {
    return defaultNames.indexOf(elem) < 0 && (elem[0] !== '_' || elem[1] !== '_');
  });
  //GraphQLModelNames : ['String', 'user', 'Int' ...]

  //convert extracted schemas into sequelize schemas, returns pairs of names and sequelize schema objects
  //sequelizeSchemas: [['user',{name:[obj],age[obj]}],['blogpost',{title:[obj],author:[obj]}]]
  var sequelizeSchemas = convertSchema(GraphQLModelNames, schema._typeMap);

  //initialize all user defined GraphQL models in sequelize with names and
  //corresponding sequelize schema objects
  //models are stored in tables object. eg. tables['User'] returns 'user' table
  initSequelizeModels(sequelizeSchemas, sequelize);

  //creates the getter functions for each developer defined GraphQL Schema
  createGetters(GraphQLModelNames, schema._typeMap, QUERY_FIELDS, tables);

  //creates an adder function for each developer defined GraphQL Schema
  createAdders(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS, tables);

  //creates an updater function for each developer defined GraphQL Schema
  createUpdaters(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS, tables);

  //creates destroyer functions for each developer defined GraphQL Schema
  createDestroyers(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS, tables);

  //initialize sequelize relations TODO: currently works for belongsToMany
  initSequelizeRelations(relationsArray, schema._typeMap, MUTATION_FIELDS);

  for (var i = 0; i < relationsArray.length; i++){
    var relation = relationsArray[i][1].name;
    var type = relationsArray[i][0];
    var typeUpper = relationsArray[i][0].charAt(0).toUpperCase()+relationsArray[i][0].slice(1);


    schema._typeMap[type]._fields[relation].resolve = (root, {name})=>{
      return tables[typeUpper].
        findOne({where: {name : root.name}})
          .then(function(user){
              return user.getFriends();
          })
    }
  }
  sequelize.sync();

  //console.log(util.inspect(QUERY_FIELDS.getUser.args, {showHidden: false, depth :null} ));
    //console.log('typemap',schema._typeMap);
  return function(req, res) {
    graphQLHandler(req, res, schema);
  }
}

function initSequelizeModels(sequelizeSchemas, sequelize){
  // take each schema, get its toUppercase name
  // add and sequelize define it to tables[modelName],
  // simultaneously create a list of modelNames
  for (var i = 0; i < sequelizeSchemas.length; i++){
    var modelName = sequelizeSchemas[i][0].charAt(0).toUpperCase()+sequelizeSchemas[i][0].slice(1);
    tables[modelName] = sequelize.define(sequelizeSchemas[i][0], sequelizeSchemas[i][1]);
  }
  //should we automatically create queries in schema.js?
  //eg getter, update, delete
}

//convertSchema takes in the user created schema in GraphQLSchema object
//and converts it into Sequelize model definitions
function convertSchema(modelNames, typeMap){
  var sequelizeArr = [];
  for(var i = 0; i < modelNames.length; i++) {
    var model = typeMap[modelNames[i]],
        fields = Object.keys(model._fields), //['name', 'age']
        sequelizeSchema = {},
        sequelizeFieldTypes = {String: Sequelize.STRING, Int: Sequelize.INTEGER};
    //console.log(fields); //expect ['name','age','friends']
    for(var j = 0; j < fields.length; j++) {
      //console.log(model._fields[fields[j]].type.name); //undefined for 'friends'
      //if model._fields[fields[j]].type.name is undefined,
      //check to see if there is ofType (which seems to denote that it is a list)
      //ofType.name should return the list type
      //if type.ofType is defined, it is GraphQLList.
      if (model._fields[fields[j]].type.ofType){
        relationsArray.push([model.name,model._fields[fields[j]]]);
        // console.log('relationsarray',relationsArray[0][1].name);
        // console.log('relationsarray',relationsArray[0][0]);

      }
      else { //isn't list
        sequelizeSchema[fields[j]] = {
          type: sequelizeFieldTypes[model._fields[fields[j]].type.name],
          field: fields[j]
        };
      }
    }
    sequelizeArr.push([modelNames[i], sequelizeSchema]);
  }
    return sequelizeArr;
}

function initSequelizeRelations(relations, typeMap, mutationFields){
  for(var i = 0; i < relations.length; i++){

    var modelName = relations[i][0];
    var table1Name = modelName.charAt(0).toUpperCase()+modelName.slice(1);
    var table2Name = relations[i][1].type.ofType.name.charAt(0).toUpperCase()
                     + relations[i][1].type.ofType.name.slice(1);
    var relationName = relations[i][1].name;
    var getterName = 'get'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//getFriends
    var creatorName = 'add'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//addFriends
    var destroyerName = 'remove'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//removeFriends

    var relationTableName = relationName+'_table'; //friends_table
    // console.log('relationTableName',relationTableName);

    //console.log(table1Name, table2Name, relationName, relationTableName);
    tables[table1Name].belongsToMany(tables[table2Name],{as : relationName, through: relationTableName});

    //relations getter
    typeMap[modelName]._fields[relationName].resolve = (root)=>{
      return tables[table1Name].
        findOne({where: {name : root.name}})
          .then(function(model){
              return model[getterName]();
          })
    }

    //TODO: Modularize!
    //creates relations creators
    // console.log('getterName,',getterName);
    // console.log('creatorName,',creatorName); //addFriends
    // console.log('typemap inputval', typeMap.__InputValue._fields);

    mutationFields[creatorName] = {
      type: typeMap.String //success/error
    };

    mutationFields[creatorName].args = [{
      name: 'model1',
      type: typeMap.String,
      description: null,
      defaultValue: null
    },
    {
      name: 'model2',
      type: typeMap.String,//[modelFields[field].type.name],
      description: null,
      defaultValue: null
    }];

    //
    mutationFields[creatorName].resolve = (root, {model1, model2})=>{
        // console.log('in resolve of',creatorName);
        var m1 = JSON.parse(model1);
        var m2 = JSON.parse(model2);
        // console.log('add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1));
            tables[table1Name].findOne({
                where: m1//{name: model1}
              }).then(function(found1, created){
                tables[table2Name].findOne({
                  where: m2//{name: model2}
                }).then(function(found2, created){
                  //TODO: currently hacky way of turning addFriends -> addFriend, which is created by Sequelize
                  found1['add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1)](found2);
                })
              });
          }

    //TODO: Modularize!
    //create relationRemovers
    //console.log('destroyerName,',destroyerName); //removeFriends

    mutationFields[destroyerName] = {
      type: typeMap.String //success/error
    };

    mutationFields[destroyerName].args = [{
      name: 'model1',
      type: typeMap.String,
      description: null,
      defaultValue: null
    },
    {
      name: 'model2',
      type: typeMap.String,//[modelFields[field].type.name],
      description: null,
      defaultValue: null
    }];

    mutationFields[destroyerName].resolve = (root, {model1, model2})=>{
        var m1 = JSON.parse(model1);
        var m2 = JSON.parse(model2);
        // console.log('remove'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1));
            tables[table1Name].findOne({
                where: m1
              }).then(function(found1, created){
                tables[table2Name].findOne({
                  where: m2
                }).then(function(found2, created){
                  //TODO: currently hacky way of turning addFriends -> addFriend, which is created by Sequelize
                  found1['remove'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1)](found2);
                })
              });
          }

  }
}

module.exports = Sandal;
