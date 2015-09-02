import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

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

let RootQuery = new GraphQLObjectType({
  name: 'query',
  description: 'this is the root query',
  fields: {
    getUser:{
      type: userType,
      description: 'get user object with provided name',
      args: {
        name: {type: GraphQLString}
      },
      resolve: (root, {name})=>{
        console.log("Query got name: "+name);
      /*console.log("get user query");*/
      //find user with the provided name and return the userobject
      return {
        name: 'Tom',
        age: 23
      }
    }
    },
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
      // console.log("add user mutation");
      // console.log('root: ' + Object.keys(root));
      // console.log('name: ' + name + ' age:' + age);
      //database returns userobject added
      return {
        name: 'Success',
        age: 23
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
