import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql, GraphQLObjectType, GraphQLList} from 'graphql';
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

  //TODO: right now, hardcoded to ..._fields.friends. instead, we should automatically/
  //set the resolve upon initSequelizeRelations for userType etc.
//   for (var i = 0; i < relationsArray.length; i++){
//     var relation = relationsArray[0][1].name;
//     var type = relationsArray[0][0].charAt(0).toUpperCase()+relationsArray[0][0].slice(1);
//
//   schema._typeMap.user._fields.relation.resolve = (root, {name})=>{
//             return tables[type].
//               findOne({where: {name : root.name}})
//                 .then(function(user){
//                   return user.getFriends();
//                 })
//           }
// }
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
  createGetters(GraphQLModelNames, schema._typeMap, QUERY_FIELDS);

  //creates an adder function for each developer defined GraphQL Schema
  createAdders(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS);

  //creates an updater function for each developer defined GraphQL Schema
  createUpdaters(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS);

  //creates destroyer functions for each developer defined GraphQL Schema
  createDestroyers(GraphQLModelNames, schema._typeMap, MUTATION_FIELDS);

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
        console.log('relationsarray',relationsArray[0][1].name);
        console.log('relationsarray',relationsArray[0][0]);

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

//modelNames: array of user created GraphQL model names e.g.['user', 'blogpost']
function createGetters(modelNames, typeMap, queryFields){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var getterName = 'get'+capitalizedName;//+'By'+field.charAt(0).toUpperCase()+field.slice(1);
    var getterNamePlural = getterName+'s';
    var modelFields = typeMap[modelNames[i]]._fields;
    getterName = 'get'+capitalizedName;//+'By'+field.charAt(0).toUpperCase()+field.slice(1);
    var args  = [];

    for (var field in modelFields){ //fields: name, age...
      var argObject = {
        name: field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argObject);
    }

    //singular, e.g. getUser
    queryFields[getterName] = {
      type: typeMap[modelNames[i]]
    };

    queryFields[getterName].args = args;

    queryFields[getterName].resolve = (root, args)=>{
      var selectorObj= {};
      for (var key in args){
        if (args[key] !== undefined){
          selectorObj[key]= args[key];
        }
      }
      return tables[capitalizedName]
          .findOne({
            where: selectorObj //e.g. { name : 'Ken' }
          });
    };

    //plural, e.g. getUsers
    queryFields[getterNamePlural] = {
      type: new GraphQLList(typeMap[modelNames[i]])
    };

    queryFields[getterNamePlural].args = args;

    queryFields[getterNamePlural].resolve = (root, args)=>{
      var selectorObj= {};
      for (var key in args){
        if (args[key] !== undefined){
          selectorObj[key]= args[key];
        }
      }
      return tables[capitalizedName]
          .findAll({
            where: selectorObj //e.g. { name : 'Ken' }
          });
    };
  }
}

function createAdders(modelNames, typeMap, mutationFields){

  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var adderName = 'add'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;

    mutationFields[adderName] = {
      type: typeMap[modelNames[i]]
    };

    var args = [];
    for (var field in modelFields){
      var argsObj = {
        name: field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argsObj);
    }

    mutationFields[adderName].args = args;

    mutationFields[adderName].resolve = (root,args)=>{
          //add to database
          return tables[capitalizedName]
            .findOrCreate({
              where: args,
              // defaults:{
              //   age: age,
              // }
            }).spread(function(user){return user}); //why spread instead of then?
        }
  }
}

function createDestroyers(modelNames, typeMap, mutationFields){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var destroyerName = 'destroy'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;
    var args = [];

    for (var field in modelFields){ //fields: name, age...
      var argObj = {
          name: field,
          type: typeMap[modelFields[field].type.name],
          description: null,
          defaultValue: null
        };
        args.push(argObj);
    }
    mutationFields[destroyerName] = {
      type: typeMap[modelNames[i]]
    };

    mutationFields[destroyerName].args = args;

    mutationFields[destroyerName].resolve = (root, args)=>{
      var deletedObject = tables[capitalizedName]
        .findOne({
          where: args
        }).then(function(data){
          return data;
        });
      tables[capitalizedName].destroy({
        where: args
      })
      return deletedObject;
    };
  }
}

function createUpdaters(modelNames, typeMap, mutationFields){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var updaterName = 'update'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;

    mutationFields[updaterName] = {
      type: typeMap[modelNames[i]]
    };

    var args = [];
    for (var field in modelFields){
      var argsObj = {
        name: field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argsObj);
      var argsObjSelector = {
        name: "_"+field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argsObjSelector);
    }

    mutationFields[updaterName].args = args;
    //console.log(mutationFields[updaterName].args);
    //console.log('mutationFields[updaterName]',mutationFields[updaterName]);

    mutationFields[updaterName].resolve = (root,args)=>{
      //filter out selector from other args
      console.log('in updateUser');
      var selectorObj = {};
      var updatedObj = {};

      //expect 1 of the underscored vars to be defined. make it selector
      //should work for multiple selectors
      for(var key in args){
        //if(key.charAt(0) === '_' && args[key] !== undefined) selectorObj[key.slice(1)] = args[key];
        if(args[key] !== undefined){
          if(key.charAt(0) === '_') selectorObj[key.slice(1)] = args[key];
          else updatedObj[key] = args[key];
        }
      }
      //rest that are defined and are not _, make them updatedObj
      //TODO: possibly findOne and update
      return tables[capitalizedName].update(
          updatedObj,
          {where:
            selectorObj
          }
        ).then(function(data){
          //do what you want with the returned data
        });
    }
  }
}

function initSequelizeRelations(relations, typeMap, mutationFields){
  for(var i = 0; i < relations.length; i++){

    var modelName = relations[i][0];
    var table1Name = modelName.charAt(0).toUpperCase()+modelName.slice(1);
    var table2Name = relations[i][1].type.ofType.name.charAt(0).toUpperCase()
                     + relations[i][1].type.ofType.name.slice(1);
    var relationName = relations[i][1].name;
    var getterName = 'get'+relationName.charAt(0).toUpperCase()+relationName.slice(1);
    var creatorName = 'add'+relationName.charAt(0).toUpperCase()+relationName.slice(1);
    var destroyerName = 'remove'+relationName.charAt(0).toUpperCase()+relationName.slice(1);

    //TODO: hardcoded to friendships because adding friends to friendsTable isn't working yet
    var relationTableName = relationName+'_table';//'friendships';
    console.log('relationTableName',relationTableName);

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

    //creates relations creators
    console.log('getterName,',getterName);
    console.log('creatorName,',creatorName); //addFriends
    console.log('typemap inputval', typeMap.__InputValue._fields);

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

    mutationFields[creatorName].resolve = (root, {model1, model2})=>{
        console.log('in resolve of',creatorName);
        var m1 = JSON.parse(model1);
        var m2 = JSON.parse(model2);
        console.log('model1',m1);
        console.log('model2',m2);
        console.log('add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1));
            tables[table1Name].findOne({
                where: m1//{name: model1}
              }).then(function(found1, created){
                tables[table2Name].findOne({
                  where: m2//{name: model2}
                }).then(function(found2, created){
                  //TODO: currently hacky way of turning addFriends -> addFriend, which is created by Sequelize
                  found1['add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1)](found2);
                  //found2[addBlah2](found1);
                })
              });
          }

    //create relationRemovers
    console.log('destroyerName,',destroyerName); //removeFriends

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
        // console.log('in resolve of',destroyerName);
        var m1 = JSON.parse(model1);
        var m2 = JSON.parse(model2);
        // console.log('model1',m1);
        // console.log('model2',m2);
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
