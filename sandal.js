import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql} from 'graphql';

let app = express();
var tables = {}; //holds our sequelize tables

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

  //TODO: make relations work
  //manually define resolve for getUser query.
  //TODO: fix so that we don't have to hard code user query + resolve
  schema._schemaConfig.query._fields.getUser.resolve = (root, {name})=>{
    return tables['User']
      .findOne({
        where: { name : name }
      })
  }

  //extract user defined schemas that we want to convert into sequelize schemas
  var defaultNames = ['String', 'query', 'Int', 'mutation', 'Boolean'];
  var GraphQLModelNames = Object.keys(schema._typeMap).filter(function(elem) {
    return defaultNames.indexOf(elem) < 0 && (elem[0] !== '_' || elem[1] !== '_');
  });

  //convert extracted schemas into sequelize schemas
  var sequelizeSchemas = convertSchema(GraphQLModelNames, schema._typeMap);

  //initialize all user defined GraphQL models in sequelize.
  //models are stored in tables object. eg. tables['User'] returns 'user' table
  initSequelizeModels(sequelizeSchemas, sequelize);

  //TODO: relations are currently hardcoded. fix this
  tables['User'].belongsToMany(tables['User'], {as: 'friends', through: 'friendships'});
  sequelize.sync();

  return function(req, res) {
    graphQLHandler(req, res, schema);
  }
}

var initSequelizeModels = (sequelizeSchemas, sequelize) => {
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
    for(var j = 0; j < fields.length; j++) {
      sequelizeSchema[fields[j]] = {
        type: sequelizeFieldTypes[model._fields[fields[j]].type.name],
        field: fields[j]
      };
    }
    sequelizeArr.push([modelNames[i], sequelizeSchema]);
  }
    return sequelizeArr;
}

module.exports = Sandal;
