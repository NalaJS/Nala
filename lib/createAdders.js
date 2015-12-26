function CreateAdders(modelNames, typeMap, mutationFields, tables){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var adderName = 'add'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;

    mutationFields[adderName] = {
      name: adderName,
      description : 'test in createAdders',
      type: typeMap[modelNames[i]]
    };

    var args = [];
    for (var field in modelFields){
      var argsObj = {
        name: field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argsObj);
    }

    mutationFields[adderName].args = args;

    mutationFields[adderName].resolve = (root,args)=>{
          //add to database
          return tables[capitalizedName]
            .findOrCreate({
              where: args,
            }).spread(function(data){return data}); //why spread instead of then?
        }
  }
}

module.exports = CreateAdders;
