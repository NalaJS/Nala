/*
Creator
params:
mutationFields
creatorName
typeMap
tables
table1Name
table2Name
relationName
*/
function CreateRelationCreators(creatorName, relationName, tables, table1Name, table2Name, mutationFields, typeMap){
  mutationFields[creatorName] = {
    name: creatorName,
    description: 'placeholder description for relationCreators',
    type: typeMap.String //success/error
  };

  mutationFields[creatorName].args = [{
    name: 'model1',
    type: typeMap.String,
    description: null,
    defaultValue: null
  },
  {
    name: 'model2',
    type: typeMap.String,//[modelFields[field].type.name],
    description: null,
    defaultValue: null
  }];

  mutationFields[creatorName].resolve = (root, {model1, model2})=>{
      // console.log('in resolve of',creatorName);
      var m1 = JSON.parse(model1);
      var m2 = JSON.parse(model2);
      // console.log('add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1));
          tables[table1Name].findOne({
              where: m1//{name: model1}
            }).then(function(found1, created){
              tables[table2Name].findOne({
                where: m2//{name: model2}
              }).then(function(found2, created){
                //TODO: currently hacky way of turning addFriends -> addFriend, which is created by Sequelize
                found1['add'+relationName.charAt(0).toUpperCase()+relationName.slice(1,relationName.length-1)](found2);
              })
            });
        }
}

module.exports = CreateRelationCreators;
