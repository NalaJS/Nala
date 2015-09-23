var React = require('react'),
    $ = require('jQuery');

var AddFriend = React.createClass({
  getInitialState: function(){
    return {
      name1:'',
      name2:'',
      displayFriends:''
    };
  },

  //Handles the adding of a friend. enter in name and who you want to add as friend.
   handleUser1: function(event) {
     this.setState({
       name1: event.target.value
     })
   },
   handleUser2: function(event) {
     this.setState({
       name2: event.target.value
     })
   },

   //function to add data to addFriend
   addFriend: function(event) {
      event.preventDefault();
      console.log('adding buddy');
      //var data = {"name1": this.state.name1, "name2": this.state.name2};
      var data = {"name1": {name : this.state.name1}, "name2": {name : this.state.name2}};

      var query = {
        'query' : 'mutation mutateUser($name1:String, $name2:String){addFriends(model1: $name1, model2:$name2)}',
        'variables': {'name1':JSON.stringify(data.name1), 'name2':JSON.stringify(data.name2)} //data.name1 is an object
      };

      $.post('/', query, function(data){
        console.log("addFriend returned: ", data);
      })
      this.setState({'name1':'', 'name2':''});


    },

    render: function() {
    	return (
    	      <div>
            <h3>Add Friend</h3>
            <form onSubmit = {this.addFriend}>
              <input type = "text" value = {this.state.name1} defaultValue = "" placeholder = "username" onChange = {this.handleUser1}/>
              <input type = "text" value = {this.state.name2} defaultValue = "" placeholder = "friend" onChange = {this.handleUser2}/>
              <button>Add Buddy</button>
            </form>
            <p>{this.state.displayFriends} </p>
            </div>
      )
    },
});

module.exports = AddFriend;
