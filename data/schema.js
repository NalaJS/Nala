import Sequelize from 'sequelize';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
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
        // resolve: (root)=>{
        //   console.log('resolving friends');
        //   console.log(root.name)
        //   return User.
        //     findOne({where: {name : root.name}})
        //       .then(function(user){
        //         console.log('test');
        //         return user.getFriends();
        //       })
        // }
      } //end of 'friends'
    })
});

let blogpostType = new GraphQLObjectType({
  name: 'blogpost',
  description: 'this is the blogpost object',
  fields: {
    'title': {type: GraphQLString},
    'content': {type: GraphQLString}
  }
});

let Query = new GraphQLObjectType({
  name: 'query',
  description: 'this is the root query',
  fields: {
    //TODO: Currently a dummy to make compilable. Make a useful function e.g. introspect available queries
    presetFunctions:{type: GraphQLInt},
    // getUser: {
    //   type: userType,
    //   // description: 'get user object with provided name',
    //   // args: {
    //   //   name: {type: GraphQLString}
    //   // }
    // }
  }
});

let Mutation = new GraphQLObjectType({
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
      resolve: (root,{name, age})=>{
      //add to database
      //database returns userobject added
      return User
        .findOrCreate({
          where: {
            name : name
          },
          defaults:{
            age: age,
          }
        }).spread(function(user){return user}); //why spread instead of then?
    }
    },
    updateUser:{
      type: userType,
      description: 'finds user of Name, and updates his/her Age',
      args:{
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
      },
      resolve: (root,{name,age})=>{
        User.update(
          {age: age},
          {where:
            {name: name}
          }
        )
      }
    },
    deleteUser:{
      type: userType,
      description: 'finds user of Name and removes user object from the database',
      args:{
        name: {type: GraphQLString}
      },
      resolve: (root, {name})=>{
        console.log('root in deleteUser: ',root);
        console.log('User in deleteUser: ',User);
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
        User.findOne({
            where: {
              name: user1
            }
          }).then(function(userone, created){
            User.findOne({
              where: {
                name: user2
              }
            }).then(function(usertwo, created){
              userone.addFriend(usertwo);
              usertwo.addFriend(userone);
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
        User.findOne({
            where: {
              name: user1
            }
          }).then(function(userone, created){
            User.findOne({
              where: {
                name: user2
              }
            }).then(function(usertwo, created){
              userone.removeFriend(usertwo);
              usertwo.removeFriend(userone);
            })
          });
      }
    }
  }
});

let schema = new GraphQLSchema({
   query : Query,
   mutation : Mutation
});

module.exports = schema;
