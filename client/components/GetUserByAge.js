var React = require('react'),
    $ = require('jQuery');

var GetUserByAge= React.createClass({
      getInitialState: function(){
        return {
          age:'',
          displayName:'',
          displayAge:''
        };
      },

      //handles when you look up the name based on the age
       handleChangeAge: function(event) {
              this.setState({
                age: event.target.value
              })
       },
       //this is where we make the function to get the age based on name entered
       getUserByAge: function(event){
         event.preventDefault();
         var user = {'age' :this.state.age};
         console.log('get user by age');
         var query = {
             //'query' : 'query queryUser{getUser(name:"'+user.name+'"){name, age}}',
             'query' : 'query queryUser($age:Int){getUser(age: $age){name, age, friends{name,age}}}',
             'variables': {'age':String(user.age)}
         }
         $.post('/', query, function(response){
           console.dir(response.data);
         });
         this.setState({'age':''});
       },

        render: function() {
        	return (
        	      <div>
                <h3>Get user by age</h3>
                <form onSubmit = {this.getUserByAge}>
                  <input type = "text"  value = {this.state.age} defaultValue = "" placeholder="Enter Age" onChange = {this.handleChangeAge}/>
                  <button>Find </button>
                </form>
                <p>{this.state.displayName} is {this.state.displayAge}</p>
                </div>
          )
        },
    });

    module.exports = GetUserByAge;
