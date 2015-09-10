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

  // let userType = new GraphQLObjectType({
  //     name: 'user',
  //     fields : {
  //       'name' : {type: GraphQLString},
  //       'age' : {type: GraphQLInt}
  //     }
  // });

  // todo: make relations work
  User.belongsToMany(User, {as: 'friends', through: 'friendships'});
  sequelize.sync();

  schema._schemaConfig.query._fields.getUser.resolve = (root, {name})=>{
    return User
      .findOne({
        where: { name : name }
      })
  }
  //console.log(schema._schemaConfig.query._fields);
  return function(req, res) {
    console.log('pre graphqlhandler');
    console.log('req body in Callback ',req.body);
    graphQLHandler(req, res, schema);
  }
}

module.exports = Sandal;
