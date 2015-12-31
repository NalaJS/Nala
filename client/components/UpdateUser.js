var React = require('react'),
    $ = require('jQuery');

var UpdateUser = React.createClass({
  getInitialState: function(){
    return {
      name:'',
      age:'',
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

  updateUser: function(event){
    event.preventDefault();
    var user  = {'name': this.state.name, 'age': this.state.age};
    var query = {
      'query' : `mutation
                 mutateUser($name:String, $age:Int) {
                  updateUser(_name:$name,age:$age)
                  {
                    name,
                    age
                  }
                }`,
      'variables' : {'name': String(user.name), 'age': user.age}
    };

    $.post('/', query);
    this.setState({'name':'', 'age':''});
  },

    render: function() {
    	return (
        <div>
          <h3>Update User</h3>
          <form onSubmit = {this.updateUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeUpdateName}/>
              <br/>
              <input type = "text"  value = {this.state.age} defaultValue = "" placeholder="Age" onChange = {this.handleChangeUpdateAge}/>
              <br/><br/>
              <button> Update </button>
          </form>
        </div>
      )
    },
});

module.exports = UpdateUser;
