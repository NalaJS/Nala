//import User from './models/UserSchema.js';
import Sequelize from 'sequelize';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
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
  friend: {
    type: Sequelize.STRING,
    field: 'friend'
  }
}, {
  freezeTableName: true
});

User.sync();

let userType = new GraphQLObjectType({
    name: 'user',
    fields : {
      'name' : {type: GraphQLString},
      'age' : {type: GraphQLInt}
    }
});

let blogpostType = new GraphQLObjectType({
  'name': 'blogpost',
  fields: {
    'id' : {type: GraphQLInt},
    'title': {type: GraphQLString},
    'author': {type: GraphQLString}
  }
});

let UserQueries = {
  getUser:{
    type: userType,
    description: 'get user object with provided name',
    args: {
      name: {type: GraphQLString}
    },
    //resolve: User.getUserByName
    resolve: (root, {name})=>{
      //make get request to database
      //return userType
      User
        .findOne({
          where: { name : name }
        })
        .then(function(user){
          console.log('user;', user);
          //resolve(user);
        })
    }
  },
  //getUsers:{...}
};

let RootQuery = new GraphQLObjectType({
  name: 'query',
  description: 'this is the root query',
  fields: {
    getUser: UserQueries.getUser,
    getBlogpost:{
      type: blogpostType,
      resolve: ()=>{console.log("get blogpost query");}
    }
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'mutation',
  description: 'this is the root mutation',
  fields: {
    addUser:{
      type: userType,
      args: {
        name: {type: GraphQLString},
        age: {type:GraphQLInt}
      },
      description: 'returns user object',
      resolve: (root, {name, age})=>{
      //add to database
      //database returns userobject added
      var data;
      User
        .findOrCreate({
          where: {
            name : name
          },
          defaults:{
            age: age,
            //friend: req.body.friend
          }
        }).spread(function(user, created){
          console.log("findOrCreate User returned: ",user.get({
            plain:true
          }));
          data = user;
        })
        console.log("findOrCreate:::");
        console.log(data);
        return data;
    }
    },
    updateUser:{
      type: userType,
      description: 'finds user of Name, and updates his/her Age',
      args:{
        name: {type: GraphQLString},
        age: {type: GraphQLInt}
      },
      resolve: (root,{name,age})=>{
        return {
          name:"Updated!",
          age:3
        }
      }
    },
    deleteUser:{
      type: userType,
      description: 'finds user of Name and removes user object from the database',
      args:{
        name: {type: GraphQLString}
      },
      resolve: (root, {name})=>{
        console.log('de');
        return {
          name: "Deleted!",
          age: 4
        }
      }
    },
    addBlogpost:{
      type: blogpostType,
      resolve: ()=>{console.log("get blogpost query");}
    }
  }
});

let schema = new GraphQLSchema({
  query : RootQuery,
  mutation : RootMutation
});

module.exports = schema;
