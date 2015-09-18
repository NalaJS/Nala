var React = require('react'),
    $ = require('jQuery');

var AddUser = React.createClass({
  getInitialState: function(){
    return {
      name:'',
      age:'',
      displayFriends:''
    };
  },

  handleChangeName: function(event) {
      this.setState({
        name: event.target.value
      })
  },

  handleChangeAge: function(event) {
      this.setState({
        age: event.target.value
      })
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

    render: function() {
    	return (
        <div>
        <h3>Create User</h3>
          <form onSubmit = {this.addUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter name" onChange = {this.handleChangeName}/>
              <input type = "text"  value = {this.state.age} defaultValue = "" placeholder="Enter age" onChange = {this.handleChangeAge}/>
              <br/>
              <br/>
              <button> Add User </button>
          </form>
        </div>
      )
    },
});

module.exports = AddUser;
