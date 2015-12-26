var React = require('react'),
    $ = require('jQuery');

var AddUser = React.createClass({
  getInitialState: function(){
    return {
      name:'',
      species:'',
      gender: '',
      birthyear: '',
      homeworld: '',
      displayFriends:''
    };
  },

  handleChangeName: function(event) {
      this.setState({
        name: event.target.value
      })
  },

  handleChangeSpecies: function(event) {
      this.setState({
        species: event.target.value
      })
  },

  handleChangeGender: function(event) {
      this.setState({
        gender: event.target.value
      })
  },

  handleChangeBirthyear: function(event) {
      this.setState({
        birthyear: event.target.value
      })
  },

  handleChangeHomeworld: function(event) {
      this.setState({
        homeworld: event.target.value
      })
  },







   addUser: function(event){
     event.preventDefault();
     var user  = {
                    'name' : this.state.name,
                    'species' : this.state.species,
                    'gender' : this.state.gender,
                    'birthyear' : this.state.birthyear,
                    'homeworld' : this.state.homeworld
                  };

     console.log('updated!');
     console.log('user:', user);
     var query = {
       'query' : 'mutation mutateUser($name:String, $species:String, $gender:String, $birthyear:String, $homeworld: String){addUser(name: $name, species: $species, gender: $gender, birthyear: $birthyear, homeworld:$homeworld){name,species,gender,birthyear,homeworld}}',//'mutation updateUser{addUser}',
       'variables' : {
                      'name' : String(user.name),
                      'species' : user.species,
                      'gender' : user.gender,
                      'birthyear' : user.birthyear,
                      'homeworld' : user.homeworld
                    }
     };

     $.post('/', query, function(response){
       console.log('addUser returned: ');
       console.dir(response);
     });
     this.setState({
                    'name' : '',
                    'species' : '',
                    'gender' : '',
                    'birthyear' : '',
                    'homeworld' : ''
                  });
   },

    render: function() {
    	return (
        <div>
        <h3>Create User</h3>
          <form onSubmit = {this.addUser}>
              <input type = "text"  value = {this.state.name} defaultValue = "" placeholder="Enter name" onChange = {this.handleChangeName}/>
              <input type = "text"  value = {this.state.species} defaultValue = "" placeholder="Enter species" onChange = {this.handleChangeSpecies}/>
              <input type = "text"  value = {this.state.gender} defaultValue = "" placeholder="Enter gender" onChange = {this.handleChangeGender}/>
              <input type = "text"  value = {this.state.birthyear} defaultValue = "" placeholder="Enter birth year" onChange = {this.handleChangeBirthyear}/>
              <input type = "text"  value = {this.state.homeworld} defaultValue = "" placeholder="Enter homeworld" onChange = {this.handleChangeHomeworld}/>
              <br/>
              <br/>
              <button> Add User </button>
          </form>
        </div>
      )
    },
});

module.exports = AddUser;
