var React = require('react'),
    $ = require('jQuery');

var DeleteUser = React.createClass({
  getInitialState: function(){
    return {
      name:''
    };
  },

  handleChangeDeleteName: function(event) {
      this.setState({
        name: event.target.value
      })
    },

  deleteUser: function(event){
    event.preventDefault();
    var user = {'name' : this.state.name};
    var query = {
      'query' : 'mutation mutateUser{deleteUser(name:"' + user.name + '"){name,age}}',
    };
    $.post('/', query, function(data){
      console.log('deleteUser returned: ');
      console.dir(data);
    });
    this.setState({'name':''});
  },

    render: function() {
    	return (
        <div>
          <h3>Delete User</h3>
          <form onSubmit = {this.deleteUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeDeleteName}/>
              <br/><br/>
              <button> Delete </button>
          </form>
        </div>
      )
    },
});

module.exports = DeleteUser;
