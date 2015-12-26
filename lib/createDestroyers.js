function CreateDestroyers(modelNames, typeMap, mutationFields, tables){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var destroyerName = 'destroy'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;
    var args = [];

    for (var field in modelFields){ //fields: name, age...
      var argObj = {
          name: field,
          type: typeMap[modelFields[field].type.name],
          description: null,
          defaultValue: null
        };
        args.push(argObj);
    }
    mutationFields[destroyerName] = {
      name: destroyerName,
      description: 'test in createDestroyers',
      type: typeMap[modelNames[i]]
    };

    mutationFields[destroyerName].args = args;

    mutationFields[destroyerName].resolve = (root, args)=>{
      var deletedObject = tables[capitalizedName]
        .findOne({
          where: args
        }).then(function(data){
          return data;
        });
      tables[capitalizedName].destroy({
        where: args
      })
      return deletedObject;
    };
  }
}

module.exports = CreateDestroyers;
