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
}, {
  freezeTableName: true
});

User.belongsToMany(User, {as: 'friends', through: 'friendships'});
sequelize.sync().then(function(){});
//User.sync();

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
      return User
        .findOne({
          where: { name : name }
        })
        .then(function(user){
          console.log(user);
          return user;
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
        })
        .then(function(user){
          console.log(user);
          return user;
        })
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
        User.update(
          {age: age},
          {where:
          {name: name}
          }
          ).then(function() {
            //console.log('data1:');
          })
      }
    },
    deleteUser:{
      type: userType,
      description: 'finds user of Name and removes user object from the database',
      args:{
        name: {type: GraphQLString}
      },
      resolve: (root, {name})=>{
        console.log('destroying'+ name);
        return User.destroy({
            where: {name: name}
          })
      }
    },
    addFriend:{
      type: GraphQLString,
      description: 'adds friendship between 2 users',
      args:{
        user1: {type: GraphQLString},
        user2: {type: GraphQLString}
      },
      resolve: (root, {user1, user2})=>{
        console.log('resolving addFriend');
        User.findOne({
            where: {
              name: user1
            },
            defaults: {
              age: ''
            }
          }).then(function(userone, created){
            User.findOne({
              where: {
                name: user2
              },
              defaults: {
                age: ''
              }
            }).then(function(usertwo, created){
              userone.addFriend(usertwo).then(function(){
                usertwo.addFriend(userone).then(function(friends){
                  userone.getFriends().then(function (friends){
                    console.log("Added friendship!");
                  })
                });
              });
            })
          });
      }
    },
    removeFriend:{
      type: GraphQLString,
      description: 'remove friendship between 2 users',
      args:{
        user1: {type: GraphQLString},
        user2: {type: GraphQLString}
      },
      resolve: (root, {user1, user2})=>{
        console.log('resolving removeFriend');
        User.findOne({
            where: {
              name: user1
            },
            defaults: {
              age: ''
            }
          }).then(function(userone, created){
            User.findOne({
              where: {
                name: user2
              },
              defaults: {
                age: ''
              }
            }).then(function(usertwo, created){
              userone.removeFriend(usertwo).then(function(){
                usertwo.removeFriend(userone).then(function(friends){
                  userone.getFriends().then(function (friends){
                    console.log("Removed friendship!");
                  })
                });
              });
            })
          });
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
