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

### Queries and Mutations

#### Introduction
Three of the four CRUD operations to the database, namely Addition(Creation), Getting(Retrieval), and Destroying(Deletion) only need search parameters passed to them, e.g. 

```javascript
var userObject = {
    name : 'Kylo',
    species : 'Human',
    gender : 'Male',
    birthyear : '??',
    homeworld : '??'
}
```
By passing `userObject` as a variable to `getUser`, or `destroyUser`, we will find the user that matches the parameters and return it or destroy it, respectively. In the case of `addUser`, we will create a user object in the database with those parameters.

Note that we can include and omit any combination of the parameters, so we can search by only `name` and `species` or by all the parameters as shown above.

#### Adding to database
```javascript
addUser: function(userObject) {

      var user = userObject;
      var mutation = {
      //this assumes we're only interested in looking for the user who matches a given name and species
        'mutation' : `
          mutation mutateUser($name:String, $species:String){
            addUser(name: $name, species: $species){
              name,
              species
            }
          }`,
        // declare the variables you want to pass along with the query
        'variables': userObject
      };
      $.post('/graphql', mutation, function(response) {
        var user = response.data.getUser;
        // do something with information
      });
    }
```
The response will be the newly created User object in the database. Adding multiple users at once is currently not supported.

#### Retrieving from database

##### Retrieving a single instance
```javascript
getUser: function(userObject) {

      var user = userObject;
      var query = {
      //this assumes we're only interested in looking for the user who matches a given name and species
        'query' : `
          query queryUser($name:String, $species:String){
            getUser(name: $name, species: $species){
              name,
              species
            }
          }`,
        // declare the variables you want to pass along with the query
        'variables': userObject
      };
      $.post('/graphql', query, function(response) {
        var user = response.data.getUser;
        // do something with information
      });
    }
```

##### Retrieving multiple instances

This slightly less trivial example shows us how we might find all users of a certain `species` who come from a given `homeworld`.
Simply add an 's' after the model name in getModel to search for all instances that satisfy the search parameters.
```javascript
getUser: function(userObject) {

      var user = userObject;
      var query = {
      //this assumes we're only interested in looking for the user who matches a given name and species
        'query' : `
          query queryUser($homeworld:String, $species:String){
            getUsers(homeworld: $homeworld, species: $species){
              name,
              birthyear,
              friends {
                name
              }
            }
          }`,
        // declare the variables you want to pass along with the query
        'variables': userObject
      };
      $.post('/graphql', query, function(response) {
        var user = response.data.getUser;
        // do something with information
      });
    }
```


#### Deleting from database
```javascript
removeUser: function(userObject) {

      var user = userObject;
      var mutation = {
        'mutation' : `
          mutation mutateUser($name:String, $species:String, $homeworld:String){
            destroyUser(name: $name, species: $species, homeworld: $homeworld){
              name,
              species,
              homeworld
            }
          }`,
        // declare the variables you want to pass along with the query
        'variables': userObject
      };
      $.post('/graphql', mutation);
    }
```

#### Updating an instance
Updating is different from the other CRUD operations in that there is a need to distinguish from the selectors (i.e. find name: 'Tom') and the parameters to be updated (i.e. change age: 23). Rather than provide many variations of updateUser to account for what the developer might want, simply prepend an underscore(_) to denote your selectors.

```javascript
updateUser: function(userObject) {

      var user = userObject;
      var mutation = {
        'mutation' : `
          mutation mutateUser($name:String, $homeworld:String){
            updateUser(_name: $name, homeworld: $homeworld){
              name,
              species,
              homeworld
            }
          }`,
        // declare the variables you want to pass along with the query
        'variables': userObject
      };
      $.post('/graphql', mutation);
    }
```
Notice the underscore before name in updateUser. In this case, we search for the user who matches the provided name and update their homeworld.
