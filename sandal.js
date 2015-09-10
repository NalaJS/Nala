import express from 'express';
import bodyParser from 'body-parser';

let app = express();

app.use(bodyParser.urlencoded());

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
  var sequelize = new Sequelize(uri);

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

  console.log(schema);//._schemaConfig.query._fields);
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
    graphQLHandler(req, res, schema);
  }
}
