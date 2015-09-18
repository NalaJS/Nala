var React = require('react'),
    $ = require('jQuery');

var GetUserByName= React.createClass({
      getInitialState: function(){
        return {
          name:'',
          displayName:'',
          displayAge:''
        };
      },

      //handles when you look up the name based on the age
       handleChangeName: function(event) {
              this.setState({
                name: event.target.value
              })
       },
       //this is where we make the function to get the age based on name entered
       getUserByName: function(event){
         event.preventDefault();
         var user = {'name' :this.state.name};
         console.log(user.name);
         var query = {
             //'query' : 'query queryUser{getUser(name:"'+user.name+'"){name, age}}',
             'query' : 'query queryUser($name:String){getUserByName(name: $name){name, age, friends{name,age}}}',
             'variables': {'name':String(user.name)}
         }
         $.post('/', query, function(response){
           console.dir(response.data);
         });
         this.setState({'name':''});
       },



        render: function() {
        	return (
        	      <div>
                <h3>Get user by name</h3>
                <form onSubmit = {this.getUserByName}>
                  <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter Name" onChange = {this.handleChangeName}/>
                  <button>Find </button>
                </form>
                <p>{this.state.displayName} is {this.state.displayAge}</p>
                </div>
          )
        },
    });

    module.exports = GetUserByName;
