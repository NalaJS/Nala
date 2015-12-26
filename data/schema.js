//import Sequelize from 'sequelize';

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
      'species' : {type: GraphQLString},
      'gender' : {type: GraphQLString},
      'birthyear' : {type: GraphQLString},
      'homeworld' : {type: GraphQLString},
      'friends' : {
        type: new GraphQLList(userType),
        description: 'Returns friends of the user. Returns empty array if user has no friends',
      }
    })
});

let planetType = new GraphQLObjectType({
  name: 'blogpost',
  description: 'this is the blogpost object',
  fields: {
    'residents': {type: GraphQLString}
  }
});

let Query = new GraphQLObjectType({
  name: 'query',
  description: 'this is the root query',
  fields: {
    //TODO:
    // Currently a dummy to make compilable. Make a useful function
    // e.g. introspect available queries
    // Needs to take in userType, blogpostType etc
    // so it is connected to schema
    presetFunctions:{type: userType},
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
