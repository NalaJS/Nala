var React = require('react'),
    $ = require('jQuery');

var GetFriends = React.createClass({
  getInitialState: function(){
    return {
      user:'',
      displayFriends:''
    };
  },

  //Handles the adding of a friend. enter in name and who you want to add as friend.
   handleUser: function(event) {
     this.setState({
       user: event.target.value
     })
   },

   //function to add data to addFriend
   getFriends: function(event) {
      event.preventDefault();
      console.log('getting buddies');
      var data = {"user": this.state.user};

      var query = {
        'query' : 'query queryUser($name:String){getFriends(name:$name){name}}',
        'variables': {'user':String(data.user)}
      };

      $.post('/', query, function(data){
        console.log("addFriend returned: ", data);
      })
      this.setState({'user':''});

    },

    render: function() {
    	return (
    	      <div>
            <h3>Get Friends</h3>
            <form onSubmit = {this.getFriends}>
              <input type = "text" value = {this.state.user} defaultValue = "" placeholder = "username" onChange = {this.handleUser}/>
              <button>Get Buddies</button>
            </form>
            <p>{this.state.displayFriends} </p>
            </div>
      )
    },
});

module.exports = GetFriends;
