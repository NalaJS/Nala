var React = require('react');
var $ = require('jQuery');
// var {graphql} = require('graphql');
// var Schema = require('../../schema');
var AddFriend = require('./AddFriend');
var RemoveFriend = require('./RemoveFriend');
var GetFriends = require('./GetFriends');

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
    };
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
      'query' : 'query queryUser($name:String){getUser(name: $name){name, age, friends{name,age}}}',//(name:$name){name, age}}}',
      'variables': {'name':String(user.name)}
  }
  $.post('/', query, function(response){
    console.dir(response.data.getUser);
  });
  this.setState({'searchName':''});
},

addUser: function(event){
  event.preventDefault();
  var user  = {'name' :this.state.name, 'age' :this.state.age};
  console.log('updated!');
  console.log('user:', user);
  var query = {
    'query' : 'mutation mutateUser($name:String, $age:Int){addUser(name: $name,age: $age){name,age}}',//'mutation updateUser{addUser}',
    'variables' : {'name':String(user.name), 'age':user.age}
  };

  $.post('/', query, function(response){
    console.log('addUser returned: ');
    console.dir(response);
  });
  this.setState({'name':'', 'age':''});
},

updateUser: function(event){
  event.preventDefault();
  var user  = {'name' :this.state.updateName, 'age' :this.state.updateAge};
  console.log('update User');
  //console.log('user updateage:', user.updateAge);
  var query = {
    'query' : 'mutation mutateUser($name:String, $age:Int){updateUser(name:$name,age:$age){name,age}}',//'mutation updateUser{updateUser}',
    'variables' : {'name': String(user.name), 'age':user.age}
  };

  $.post('/', query, function(response){
    console.log('updateUser returned: ');
    console.dir(response);
    //console.log("updateUser returned: " + response);
  });
  this.setState({'updateName':'', 'updateAge':''});
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
  this.setState({'deleteName':''});
},

render: function() {
	return (
	      <div>
        <h3 style={h3style}>Create User</h3>
          <form onSubmit = {this.addUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeName}/>
              <br/>
              <input type = "text"  value = {this.state.age} defaultValue = "" placeholder="Age" onChange = {this.handleChangeAge}/>
               <br/><br/>
              <button> Add </button>
          </form>
          <h3 style={h3style}>Retrieve User</h3>
          <form onSubmit = {this.getUser}>
              <input type = "text"  value = {this.state.searchName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeSearchName}/>
              <br/><br/>
              <button> Get </button>
          </form>
          <h3 style={h3style}>Update User</h3>
          <form onSubmit = {this.updateUser}>
              <input type = "text"  value = {this.state.updateName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeUpdateName}/>
              <br/>
              <input type = "text"  value = {this.state.updateAge} defaultValue = "" placeholder="Age" onChange = {this.handleChangeUpdateAge}/>
              <br/><br/>
              <button> Update </button>
          </form>
          <h3 style={h3style} >Delete User</h3>
          <form onSubmit = {this.deleteUser}>
              <input type = "text"  value = {this.state.deleteName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeDeleteName}/>
              <br/><br/>
              <button> Delete </button>
          </form>

          Returned Data:
          <p>
          Name:{this.state.displayName} <br/>
          Age: {this.state.displayAge}
          </p>
          <AddFriend/>
          <RemoveFriend/>
          <GetFriends/>
	      </div>
	    )
  }

});

var h3style = {
color: 'midnightblue',
};


module.exports = Page;
