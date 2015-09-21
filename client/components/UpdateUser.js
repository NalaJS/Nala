var React = require('react'),
    $ = require('jQuery');

var UpdateUser = React.createClass({
  getInitialState: function(){
    return {
      name:'',
      age:'',
      selector: '',
      displayFriends:''
    };
  },

  handleChangeUpdateName: function(event) {
    this.setState({
      name: event.target.value
    })
  },

  handleChangeUpdateAge: function(event) {
    this.setState({
      age: event.target.value
    })
  },

  handleChangeUpdateSelector: function(event) {
    this.setState({
      selector: event.target.value
    })
  },

  updateUser: function(event){
    event.preventDefault();
    var user  = {'name' :this.state.name, 'age' :this.state.age, 'selector':this.state.selector};
    var query = {
      'query' : 'mutation mutateUser($name:String, $age:Int, $selector:String){updateUser(name:$name,age:$age,selector:$selector){name,age}}',//'mutation updateUser{updateUser}',
      'variables' : {'name': String(user.name), 'age':user.age, 'selector':user.selector}
    };

    $.post('/', query, function(response){
      console.log('updateUser returned: ');
      console.dir(response);
    });
    this.setState({'name':'', 'age':'', 'selector':''});
  },

    render: function() {
    	return (
        <div>
          <h3>Update User</h3>
          <form onSubmit = {this.updateUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeUpdateName}/>
              <br/>
              <input type = "text"  value = {this.state.age} defaultValue = "" placeholder="Age" onChange = {this.handleChangeUpdateAge}/>
              <br/>
              <input type = "text"  value = {this.state.selector} defaultValue = "" placeholder="Selector" onChange = {this.handleChangeUpdateSelector}/>
              <br/><br/>
              <button> Update </button>
          </form>
        </div>
      )
    },
});

module.exports = UpdateUser;
