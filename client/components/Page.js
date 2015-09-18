var React = require('react');
var $ = require('jQuery');
var AddUser = require('./AddUser');
var GetUserByAge = require('./GetUserByAge');
var GetUserByName = require('./GetUserByName');
var GetUsersByName = require('./GetUsersByName');
var GetUsersByAge = require('./GetUsersByAge');
var UpdateUser = require('./UpdateUser');
var DeleteUser = require('./DeleteUser');
var AddFriend = require('./AddFriend');
var RemoveFriend = require('./RemoveFriend');

var Page = React.createClass({

render: function() {
	return (
	      <div>
          <AddUser/>
          <AddFriend/>
          <RemoveFriend/>
          <GetUserByAge/>
          <GetUserByName/>
          <GetUsersByAge/>
          <GetUsersByName/>
          <UpdateUser/>
          <DeleteUser/>
	      </div>
	    )
  }
});

var h3style = {
color: 'midnightblue',
};

module.exports = Page;
