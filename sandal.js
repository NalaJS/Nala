import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql} from 'graphql';
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

  //TODO: right now, hardcoded to ..._fields.friends. instead, we should automatically/
  //set the resolve upon initSequelizeRelations for userType etc.
  schema._typeMap.user._fields.friends.resolve = (root, {name})=>{
            return tables['User'].
              findOne({where: {name : root.name}})
                .then(function(user){
                  return user.getFriends();
                })
          }

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

  //creates the getter functions for each user defined GraphQL Schema
  createGetters(GraphQLModelNames, schema._typeMap, QUERY_FIELDS);

  //initialize sequelize relations TODO: currently works for belongsToMany
  initSequelizeRelations(relationsArray);

  sequelize.sync();

  //console.log(util.inspect(QUERY_FIELDS.getUser.args, {showHidden: false, depth :null} ));

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
    var getterName = 'get'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;
    var modelFieldsNames = Object.keys(typeMap[modelNames[i]]._fields);
    console.log(modelNames[i]+" fields:");
    console.log(modelFields);
    queryFields[getterName] = {
      type: typeMap[modelNames[i]]
    };
    //TODO: getUser, getUserByName etc. by fields in userType
    queryFields[getterName].args = [{
        name: 'name',
        type: typeMap.String, //GraphQLString
        description: null,
        defaultValue: null
      }];
    queryFields[getterName].resolve = (root, {name})=>{
      return tables[capitalizedName]
        .findOne({
          where: { name : name }
        })
    };
  }
}

function initSequelizeRelations(relations){
  for(var i = 0; i < relations.length; i++){

    var table1Name = relations[i][0].charAt(0).toUpperCase()+relations[i][0].slice(1);
    var table2Name = relations[i][1].type.ofType.name.charAt(0).toUpperCase()
                     + relations[i][1].type.ofType.name.slice(1);
    var relationName = relations[i][1].name;
    //TODO: hardcoded to friendships because adding friends to friendsTable isn't working yet
    var relationTableName = 'friendships';//relations[i][1].name+'Table';

    //console.log(table1Name, table2Name, relationName, relationTableName);
    tables[table1Name].belongsToMany(tables[table2Name],{as : relationName, through: relationTableName});
  }
}

module.exports = Sandal;
