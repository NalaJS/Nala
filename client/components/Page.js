var React = require('react');
var $ = require('jQuery');
// var {graphql} = require('graphql');
// var Schema = require('../../schema');

var Page = React.createClass({

  getInitialState: function(){
    return {name: "",
    age:"",
    friend:'',
    searchName:"",
    displayName:"",
    displayAge:""
    } ;
  },
handleChangesearchName: function(event) {
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
handleChangeAge: function(event) {
    //console.log('handle');
    this.setState({
      age: event.target.value
    })
  },
handleChangeFriend: function(event) {
      //console.log('handle');
    this.setState({
      friend: event.target.value
    })
  },

getUser: function(event){
  console.log("get user");
  event.preventDefault();
  var user = {'name' :this.state.searchName};
  var query = {
      'query' : 'query getUser{getUser(name: " '+user.name+'"){name,age}}'
  }
  $.post('/', query, function(response){
    console.log("get user response");
  });
},

addUser: function(event){
  event.preventDefault();
  var user  = {'name' :this.state.name, 'age' :this.state.age};
  console.log('updated!');
  console.log('user:', user);
  var query = {
    'query' : 'mutation updateUser{addUser(name:"'+user.name+'",age:'+user.age+'){name,age}}',//'mutation updateUser{addUser}',
    //'variables' : {'user': String(user.name), 'age':user.age}
  };

  $.post('/', query, function(response){
    console.log("user signup response");
  });
},

render: function() {
	return (
	      <div>
        Add User
          <form onSubmit = {this.addUser}>
              <input type = "text"  name = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeName}/>
              <br/>
              <input type = "text"  age = {this.state.age} defaultValue = "" placeholder="Age" onChange = {this.handleChangeAge}/>
               <br/><br/>
              <button> Enter </button>
          </form>
          Get User
          <form onSubmit = {this.getUser}>
              <input type = "text"  searchName = {this.state.searchName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangesearchName}/>
              <button> Enter </button>
          </form>
          Returned Data:
          <p>
          Name:{this.state.displayName} <br/>
          Age: {this.state.displayAge}
          </p>

	      </div>
	    )
  }
});

module.exports = Page;
