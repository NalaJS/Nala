var React = require('react');
var $ = require('jQuery');
// var {graphql} = require('graphql');
// var Schema = require('../../schema');

var Page = React.createClass({

  getInitialState: function(){
    return {name: "",
    age:"",
    friend:'',
    loginName:"",
    displayName:"",
    displayAge:""
    } ;
  },
handleChangeloginName: function(event) {
      //console.log('handle');
      this.setState({
        loginName: event.target.value
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

getUserAge: function(event){
  event.preventDefault();
  //.log("send name being run");
  var data = {'name' :this.state.loginName};
  //console.log('getUserAgedata:', data);
  this.userAge(data);
},

userAge: function(user){
    console.log('user:', user);
    $.ajax({
      dataType: 'json', //dataType requests json
      contentType: 'application/json', //contentType sends json
      type: 'POST',
      url: '/age',
      data: JSON.stringify(user),
      success: function(data){
        //console.log('return age data', data);
        this.setState ({
          displayAge:data.age
        });
        console.log(this.state.displayAge);
        this.setState({
          displayName:data.name
        });
      }.bind(this),
      error: function(xhr, status, err){
        console.error('/age', status, err.toString());
      }.bind(this)
    });
},


addUser: function(event){
  event.preventDefault();
  var data  = {'name' :this.state.name, 'age' :this.state.age};
  console.log('data:', data);
  this.userSignup(data);
},

userSignup: function(user){
  var query = {
    'query' : 'mutation updateUser{addUser}',
    'variables' : {'user': String(user.name), 'age':user.age}
  };

  console.log(query);
  $.post('/', query, function(response){
    console.log("user signup response");
  });

  // graphql(Schema, `{
  //   getUser {
  //     name,
  //     age
  //   }
  // }`).then((result)=>console.log(result));
    // $.ajax({
    //   //dataType: 'json', //dataType requests json
    //   contentType: 'application/json', //contentType sends json
    //   type: 'POST',
    //   url: '/user',
    //   data: JSON.stringify(user),
    //   success: function(data){
    //     console.log(data);
    //   }.bind(this),
    //   error: function(xhr, status, err){
    //     console.error('/user', status, err.toString());
    //   }.bind(this)
    // });
},


render: function() {
  //console.log("renderannnnnggggg");
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
              <input type = "text"  loginName = {this.state.loginName} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeloginName}/>
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
