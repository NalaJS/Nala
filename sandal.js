import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql} from 'graphql';

let app = express();
var tables = {}; //holds our sequelize tables
var relationsArray = [];

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

function Sandal(schema,uri){
  // eventually parse uri for different dbs

  var sequelize = new Sequelize(uri);
  var QUERY_FIELDS = schema._schemaConfig.query._fields;



  //console.log(schema);
  //console.log(schema._typeMap.user._fields.friends);

  //TODO: make relations work
  //manually define resolve for getUser query.
  //TODO: fix so that we don't have to hard code user query + resolve
  // QUERY_FIELDS.getUser.resolve = (root, {name})=>{
  //   return tables['User']
  //     .findOne({
  //       where: { name : name }
  //     })
  // }
  //QUERY_FIELDS[getX] = {

  //}

  //TODO: right now, hardcoded to ..._fields.friends. instead, we should automatically/
  //set the resolve upon initSequelizeRelations for userType etc.
  schema._typeMap.user._fields.friends.resolve = (root, {name})=>{
            //console.log('resolving friends');
            //console.log(root.name)
            return tables['User'].
              findOne({where: {name : root.name}})
                .then(function(user){
                  //console.log('test');
                  return user.getFriends();
                })
          }

  //extract user defined schemas that we want to convert into sequelize schemas
  var defaultNames = ['String', 'query', 'Int', 'mutation', 'Boolean'];
  var GraphQLModelNames = Object.keys(schema._typeMap).filter(function(elem) {
    return defaultNames.indexOf(elem) < 0 && (elem[0] !== '_' || elem[1] !== '_');
  });

  //convert extracted schemas into sequelize schemas, returns pairs of names and sequelize schema objects
  var sequelizeSchemas = convertSchema(GraphQLModelNames, schema._typeMap);

  //console.log('sequelizeSchemas:');
  //console.log(sequelizeSchemas);
  //initialize all user defined GraphQL models in sequelize with names and
  //corresponding sequelize schema objects
  //models are stored in tables object. eg. tables['User'] returns 'user' table
  initSequelizeModels(sequelizeSchemas, sequelize);
  createGetters(GraphQLModelNames, schema._typeMap, QUERY_FIELDS);
  initSequelizeRelations(relationsArray);
  //TODO: relations are currently hardcoded. fix this
  //tables['User'].belongsToMany(tables['User'], {as: 'friends', through: 'friendships'});
  sequelize.sync();

  console.log('query fields');
  console.log(QUERY_FIELDS.getUser.args);
  console.log('query fields end');


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
    console.log('typeMap:', typeMap);
    console.log("model:");
    console.log(model);
    for(var j = 0; j < fields.length; j++) {
      //console.log(model._fields[fields[j]].type.name); //undefined for 'friends'
      //console.log(model);
      //console.log(typeMap)
      //console.log(model._fields[fields[j]]);
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

function createGetters(modelNames, typeMap, queryFields){
  for(var i = 0; i < modelNames.length; i++){
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var getterName = 'get'+capitalizedName;
    queryFields[getterName] = {
      type: typeMap[modelNames[i]],
      description: `gets ${modelNames[i]} object`,
      args: {
        name: {type: typeMap.String}
      },
      name: getterName,
      resolve: (root, {name})=>{
        console.log('reached created getter!');
        return tables[capitalizedName]
          .findOne({
            where: { name : name }
          })
      }
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

    console.log(table1Name, table2Name, relationName, relationTableName);
    tables[table1Name].belongsToMany(tables[table2Name],{as : relationName, through: relationTableName});
  }
}

module.exports = Sandal;
