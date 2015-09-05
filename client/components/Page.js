var React = require('react');
var $ = require('jQuery');
// var {graphql} = require('graphql');
// var Schema = require('../../schema');
var AddFriend = require('./AddFriend');
var RemoveFriend = require('./RemoveFriend');

var Page = React.createClass({

  getInitialState: function(){
    return {name: "",
    age:"",
    friend:'',
    searchName:"",
    displayName:"",
    displayAge:"",
    updateName:"",
    updateAge:"",
    deleteName:""
    } ;
  },
handleChangeSearchName: function(event) {
      //console.log('handle');
      this.setState({
        searchName: event.target.value
      })
  },

handleChangeName: function(event) {
    //console.log('handle');
    this.setState({
      name: event.target.value
    })
  },

  handleChangeDeleteName: function(event) {
      //console.log('handle');
      this.setState({
        deleteName: event.target.value
      })
    },
handleChangeAge: function(event) {
    //console.log('handle');
    this.setState({
      age: event.target.value
    })
  },
  handleChangeUpdateName: function(event) {
      //console.log('handle');
      this.setState({
        updateName: event.target.value
      })
    },
  handleChangeUpdateAge: function(event) {
      //console.log('handle');
      this.setState({
        updateAge: event.target.value
      })
    },
handleChangeFriend: function(event) {
      //console.log('handle');
    this.setState({
      friend: event.target.value
    })
  },

getUser: function(event){
  event.preventDefault();
  var user = {'name' :this.state.searchName};
  var query = {
      //'query' : 'query queryUser{getUser(name:"'+user.name+'"){name, age}}',
      'query' : 'query queryUser($name:String){getUser(name: $name){name, age}}',
      'variables': {'name':String(user.name)}
  }
  $.post('/', query, function(response){
    console.dir(response.data.getUser);
  });
},

addUser: function(event){
  event.preventDefault();
  var user  = {'name' :this.state.name, 'age' :this.state.age};
  console.log('updated!');
  console.log('user:', user);
  var query = {
    'query' : 'mutation mutateUser{addUser(name:"'+user.name+'",age:'+user.age+'){name,age}}',//'mutation updateUser{addUser}',
    //'variables' : {'user': String(user.name), 'age':user.age}
  };

  $.post('/', query, function(response){
    console.log('addUser returned: ');
    console.dir(response);
  });
},

updateUser: function(event){
  event.preventDefault();
  var user  = {'name' :this.state.updateName, 'age' :this.state.updateAge};
  console.log('update User');
  //console.log('user updateage:', user.updateAge);
  var query = {
    'query' : 'mutation mutateUser{updateUser(name:"'+user.name+'",age:'+user.age+'){name,age}}',//'mutation updateUser{updateUser}',
    //'variables' : {'user': String(user.name), 'age':user.age}
  };

  $.post('/', query, function(response){
    console.log('updateUser returned: ');
    console.dir(response);
    //console.log("updateUser returned: " + response);
  });
},

deleteUser: function(event){
  event.preventDefault();
  var user = {'name' : this.state.deleteName};
  var query = {
    'query' : 'mutation mutateUser{deleteUser(name:"' + user.name + '"){name,age}}',
  };
  $.post('/', query, function(data){
    console.log('deleteUser returned: ');
    console.dir(data);
  });
},

render: function() {
	return (
	      <div>
        Create User
          <form onSubmit = {this.addUser}>
              <input type = "text"  name = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeName}/>
              <br/>
              <input type = "text"  age = {this.state.age} defaultValue = "" placeholder="Age" onChange = {this.handleChangeAge}/>
               <br/><br/>
              <button> Add </button>
          </form>
          Retrieve User
          <form onSubmit = {this.getUser}>
              <input type = "text"  searchName = {this.state.searchName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeSearchName}/>
              <br/><br/>
              <button> Get </button>
          </form>
          Update User
          <form onSubmit = {this.updateUser}>
              <input type = "text"  searchName = {this.state.updateName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeUpdateName}/>
              <br/>
              <input type = "text"  age = {this.state.updateAge} defaultValue = "" placeholder="Age" onChange = {this.handleChangeUpdateAge}/>
              <br/><br/>
              <button> Update </button>
          </form>
          Delete User
          <form onSubmit = {this.deleteUser}>
              <input type = "text"  searchName = {this.state.deleteName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeDeleteName}/>
              <br/><br/>
              <button> Delete </button>
          </form>

          Returned Data:
          <p>
          Name:{this.state.displayName} <br/>
          Age: {this.state.displayAge}
          </p>
          <AddFriend />
          <RemoveFriend />
	      </div>
	    )
  }
});

module.exports = Page;
