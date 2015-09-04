import Sequelize from 'sequelize';

var sequelize = new Sequelize('postgres://localhost/test');

let User = sequelize.define('users', {

  name: {
    type: Sequelize.STRING,
    field: 'name'
  },
  age: {
    type: Sequelize.STRING,
    field: 'age'
  },
  friend: {
    type: Sequelize.STRING,
    field: 'friend'
  }
}, {
  freezeTableName: true
});

User.sync();

exports.User = User;

exports.getUserByName = (root,{name})=>{
  return new Promise((resolve,reject)=>{
    User
      .findOne({
        where: { name : name }
      })
      .then(function(user){
        console.log('user;', user);
        resolve(user);
      })
  });
};
