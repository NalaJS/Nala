//import Sequelize from 'sequelize';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
<<<<<<< HEAD
  GraphQLList,
} from 'graphql';

var sequelize = new Sequelize('postgres://localhost/test');

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

User.belongsToMany(User, {as: 'friends', through: 'friendships'});
sequelize.sync().then(function(){});

let blogpostType = new GraphQLObjectType({
    name: 'blogpost',
    fields : {
      'title' : {type: GraphQLString},
      'author' : {type: GraphQLInt},
    }
});

let userType = new GraphQLObjectType({
    name: 'user',
    fields : ()=> ({
      'name' : {type: GraphQLString},
      'age' : {type: GraphQLInt},
      //friends is a GraphQLList that when parsed by sequelizeParser, we create the
      //User.belongsToMany(User /*based on GraphQLList(userType)*/, {as: 'friends', through: 'friendsTable'});
      //we see that 'friends' belongs to a userType, so we query User.findOne(...)
      //possibly make the table called 'friends'+'Table' automatically.
      //query should always auto-access the friendsTable and return all the friends associated with the user
      'friends' : {
        type: new GraphQLList(userType),
        description: 'Returns friends of the user. Returns empty array if user has no friends',
        resolve: (root)=>{
          return User.
            findOne({where: {name : root.name}})
              .then(function(user){
                return user.getFriends();
              })
        }
      } //end of 'friends'
    }) //end of fields
=======
  GraphQLList
} from 'graphql';

let userType = new GraphQLObjectType({
    name: 'user', //TODO: Force user to give same name as table name
    description: 'this is the user type',
    fields : ()=>({
      'name' : {type: GraphQLString},
      'age' : {type: GraphQLInt},
      'friends' : {
        type: new GraphQLList(userType),
        description: 'Returns friends of the user. Returns empty array if user has no friends',
      }
    })
});

let blogpostType = new GraphQLObjectType({
  name: 'blogpost',
  description: 'this is the blogpost object',
  fields: {
    'title': {type: GraphQLString},
    'content': {type: GraphQLString}
  }
>>>>>>> modularize
});

let Query = new GraphQLObjectType({
  name: 'query',
  description: 'this is the root query',
  fields: {
<<<<<<< HEAD
    getUser: {
      type: userType,
      description: 'get user object with provided name',
      args: {
        name: {type: GraphQLString},
      },
      resolve: (root, {name})=>{
        return User
          .findOne({
            where: { name : name }
          })
      }
    }
=======
    //TODO:
    // Currently a dummy to make compilable. Make a useful function
    // e.g. introspect available queries
    // Needs to take in userType, blogpostType etc
    // so it is connected to schema
    presetFunctions:{type: userType},
>>>>>>> modularize
  }
});

let Mutation = new GraphQLObjectType({
  name: 'mutation',
  description: 'this is the root mutation',
  fields: {
    presentMutator:{type: userType},
  }
});

let schema = new GraphQLSchema({
   query : Query,
   mutation : Mutation
});

module.exports = schema;
