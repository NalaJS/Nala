# Nala
An ORM for connecting GraphQL servers to SQL databases

## Overview
### Connecting to a SQL database
```javascript
import Nala from 'Nala'
import Schema from './data/schema';

let graphQLHandler = Nala(Schema, 'postgres://localhost/example_database');
```
Nala takes in two inputs: a GraphQL `Schema` and a database URI.

### Handling a query
Nala returns a graphQLHandler to which you can pass GraphQL requests:
```javascript
// using Express
app.use('/graphql', graphQLHandler);
```
`graphQLHandler` will resolve requests based on the `Schema` provided.

### Automatic database model generation
Typically in your GraphQL `schema`, you define both your GraphQL models and your database models:

```javascript
let userType = new GraphQLObjectType({
    name: 'user',
    description: 'this is the user type',
    fields : ()=>({
      'name' : {type: GraphQLString},
      'species' : {type: GraphQLString},
      'gender' : {type: GraphQLString},
      'birthyear' : {type: GraphQLString},
      'homeworld' : {type: GraphQLString}
    })
});

// using Sequelize
let User = sequelize.define('users', {
  name : {type : Sequelize.STRING},
  species : {type : Sequelize.STRING},
  gender : {type : Sequelize.STRING},
  birthyear : {type : Sequelize.STRING},
  homeworld : {type : Sequelize.STRING}
});
```
Nala parses your GraphQL `Schema` for all developer defined models and automatically generates the database models so we only need to define the GraphQL model as shown below:
```javascript
let userType = new GraphQLObjectType({
    name: 'user',
    description: 'this is the user type',
    fields : ()=>({
      'name' : {type: GraphQLString},
      'species' : {type: GraphQLString},
      'gender' : {type: GraphQLString},
      'birthyear' : {type: GraphQLString},
      'homeworld' : {type: GraphQLString}
    })
});
```
