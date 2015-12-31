import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql, GraphQLObjectType, GraphQLList} from 'graphql';
import createGetters from './lib/CreateGetters';
import createAdders from './lib/CreateAdders';
import createUpdaters from './lib/CreateUpdaters';
import createDestroyers from './lib/CreateDestroyers';
import createRelationCreators from './lib/relations/n:m/RelationCreators';
import createRelationRemovers from './lib/relations/n:m/RelationRemovers';

import util from 'util';

let app = express();
var tables = {}; //holds our sequelize tables
var relationsArray = [];

console.log('Nala is running');

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

function Nala(schema,uri){
  //TODO: eventually parse uri for different dbs
  var sequelize = new Sequelize(uri);
  var QUERY_FIELDS = schema._queryType._fields;
  var MUTATION_FIELDS = schema._mutationType._fields;

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

  sequelize.sync();

  //console.log(util.inspect(QUERY_FIELDS.getUser.args, {showHidden: false, depth :null} ));
    //console.log('typemap',schema._typeMap);
  return function(req, res) {
    graphQLHandler(req, res, schema);
  }
}

//TODO: currently doesn't handle GraphQLList(GraphQLStaticType)
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
      //if model._fields[fields[j]].type.name is undefined, it is not scalar
      // model._fields[fields[j]].type.ofType.name gives the type of the GraphQLList

      // TODO: handle non GQLList associations
      // if (model._fields[fields[j]].type.constructor === GraphQLList ||
      //     model._fields[fields[j]].type.constructor === GraphQLObject)
      // OR (bring in ScalarType when ready to handle non list as well)
      // if (model._fields[fields[j]].type.constructor !== GraphQLScalarType)

      // if it is a list with non scalar type or if it is non scalar type, it is a relation
      if ( (model._fields[fields[j]].type.constructor === GraphQLList /*&&
            model._fields[fields[j]].type.ofType.constructor.name !== 'GraphQLScalarType'*/)) {
        relationsArray.push([model.name, model._fields[fields[j]]]);
        //console.log('relationsarray',relationsArray[0][1]); //gqllist obj (e.g. friends)
        //console.log('relationsarray',relationsArray[0][0]); //gqllist type (e.g. user)

      }
      //TODO: determine if self referencing is only issue. might be if it is any
      // user defined model at all
      // if self referencing, e.g. userType has a 'spouse' of userType
      else if (modelNames[i] === model._fields[fields[j]].type.name) {
        //TODO: defer init self referencing till later
      }
      else { // is ScalarType
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

// determines the relation (1:1, 1:n, n:m)
// once relationship is determined, set up get, add, rm Relations
function initSequelizeRelations(relations, typeMap, mutationFields){
  for (var i = 0; i < relations.length; i++){

    // if gqllist, n:m or 1:n
    if (relations[i][1].type.constructor.name === 'GraphQLList') {
      initToManyRelations(relations[i], typeMap, mutationFields);
    }
    // if not gqllist, 1:1 or 1:n
    else if (relations[i][1].type.constructor.name === 'GraphQLObjectType') {
      // TODO: handle if relation isn't graphql list. One to one?
      initToOneRelations(relations[i], typeMap, mutationFields);
    }
  }
}

function initToManyRelations(relation, typeMap, mutationFields) {
  var modelName = relation[0]; //e.g. artist
  var table1Name = modelName.charAt(0).toUpperCase()+modelName.slice(1); //e.g. Artist
  var table2Name = relation[1].type.ofType.name.charAt(0).toUpperCase()
                   + relation[1].type.ofType.name.slice(1);//e.g Album
  var relationName = relation[1].name; //e.g. album-artists_table // friends
  var getterName = 'get'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//getFriends
  var creatorName = 'add'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//addFriends
  var destroyerName = 'remove'+relationName.charAt(0).toUpperCase()+relationName.slice(1);//removeFriends


  var relationTableName = relationName+'_table'; //friends_table
  // console.log('relationTableName',relationTableName);

  // console.log(table1Name, table2Name, relationName, relationTableName);
  tables[table1Name].belongsToMany(tables[table2Name],{as : relationName, through: relationTableName});

  //relations getter
  //TODO: eventually allow args for constraints e.g. friends(limit 5 or name='Tom')
  typeMap[modelName]._fields[relationName].resolve = (root)=>{
    return tables[table1Name].
      findOne({where: {name : root.name}})
        .then(function(model){
            return model[getterName]();
        })
  };

  createRelationCreators(creatorName, relationName, tables, table1Name, table2Name, mutationFields, typeMap);
  createRelationRemovers(destroyerName, relationName, tables, table1Name, table2Name, mutationFields, typeMap);
}

function initToOneRelations(relation, typeMap, mutationFields) {
  //1:1 needs get, set, create
  var modelName = relation[0]; //artist
  var table1Name = relation[0].toUpperCase()+modelName.slice(1); //Artist
  var table2Name = relation[1].type.ofType.name.charAt(0).toUpperCase()
                   + relation[1].type.ofType.name.slice(1);//e.g Album
  var getterName = 'get' + table2Name;
  var setterName = 'set' + table2Name;
  var creatorName = 'create' + table2Name;

  //tables[table1Name].belongsTo(tables[table2Name]);

  console.log(table1Name, table2Name);
  //getAlbum:
  // typeMap[modelName]._fields[table2Name]

  //setAlbum:


}

function createRelation_singular(queryFields, getterName, typeMap) {
  queryFields[getterName] = {
    name: getterName,
    description: 'placeholder description for 1:1 relation getter',
    type: typeMap.String //success/error
  };

  //find out what args getAlbum can take and establish
  // args are any possible combination of args in the model

  //resolve
  queryFields[getterName].resolve = (root)=>{

  };


}

function getRelation_singular() {

}

function setRelation_singular() {

}


module.exports = Nala;
