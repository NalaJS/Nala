import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {graphql} from 'graphql';

let app = express();

console.log('Sandal is running');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

async function graphQLHandler(req, res, schema){
  console.log('in graphqlhandler');
  console.log('req ',req);
  console.log('req.body', req.body);
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
  var sequelize = new Sequelize(uri);
  console.log('Sandal init');

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

  // get rid of this
  User.belongsToMany(User, {as: 'friends', through: 'friendships'});

  // get rid of this
  sequelize.sync();

  //console.log(schema);//._schemaConfig.query._fields);
  //console.log(schema._schemaConfig.query._fields);
  schema._schemaConfig.query._fields.getUser.resolve = (root, {name})=>{
    console.log('resolving in getUser');
    console.log('root in getUser: ',root);
    console.log('name arg in getUser: ',name);
    //return User
    console.log('User in getUser: ', User);
    console.log('got here');
    return User
      .findOne({
        where: { name : name }
      })
    console.log('getUser returned: ',user);
  }
  console.log(schema._schemaConfig.query._fields);
  return function(req, res) {
    console.log('pre graphqlhandler');
    console.log('req body in Callback ',req.body);
    graphQLHandler(req, res, schema);
  }
}

module.exports = Sandal;
