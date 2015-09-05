var React = require('react'),
    $ = require('jQuery');

var RemoveFriend = React.createClass({
  getInitialState: function(){
    return {
      user1:'',
      user2:'',
    };
  },

  //Handles the removing of a friend. enter in name and who you want to remove as friend.
   handleUser1: function(event) {
     this.setState({
       user1: event.target.value
     })
   },
   handleUser2: function(event) {
     this.setState({
       user2: event.target.value
     })
   },

   //function to remove data to addFriend
   removeFriend: function(event) {
      event.preventDefault();
      console.log('removing buddy');
      var data = {"user1": this.state.user1, "user2": this.state.user2};
      var query = {
        'query' : 'mutation mutateUser{removeFriend(user1:"'+data.user1+'",user2:"'+data.user2+'")}'
      };
      $.post('/', query, function(data){
        console.log("removingFriend returned: ", data);
      })
    },

    render: function() {
    	return (
    	      <div>
            <h3>Remove Friend</h3>
            <form onSubmit = {this.removeFriend}>
              <input type = "text" user1 = {this.state.user1} defaultValue = "" placeholder = "username" onChange = {this.handleUser1}/>
              <input type = "text" user2 = {this.state.user2} defaultValue = "" placeholder = "friend" onChange = {this.handleUser2}/>
              <button>Remove Buddy</button>
            </form>
            <p>{this.state.displayFriends} </p>
            </div>
      )
    },
});

module.exports = RemoveFriend;
