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

### Automatic database model and association generation
Typically in your GraphQL `schema`, you define both your GraphQL models and their corresponding database models. Note that below you also explicitly define the association between two models, in this case, `User` with another `User` as friends.

#### Without Nala
```javascript
let userType = new GraphQLObjectType({
    name: 'user',
    description: 'this is the user type',
    fields : ()=>({
      'name' : {type: GraphQLString},
      'species' : {type: GraphQLString},
      'gender' : {type: GraphQLString},
      'birthyear' : {type: GraphQLString},
      'homeworld' : {type: GraphQLString},
      // association with another model
      'friends' : {
        type: new GraphQLList(userType),
        description: 'Returns friends of the user. Returns empty array if user has no friends',
        resolve: (root)=> {
          return User.findOne({where: {name : root.name}})
            .then(function(user){
                return user.getFriends();
            })
        }
      }
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

// explicit definition of associations
User.belongsToMany(User, {through: 'friends_table', as: 'friends'});
```

#### With Nala
Nala parses your GraphQL `Schema` for all developer defined models and automatically generates the database models so we only need to define the GraphQL models. The association is also automatically determined and generated.

Notice that you don't have to define how to resolve friends either. Nala handles that for you as well. Refer to the documentation below for more information.

**Note:** The table name is created by taking the field name and appending '_table'. In this case, the table name is `friends_table`
```javascript
let userType = new GraphQLObjectType({
    name: 'user',
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
```


###
