function CreateUpdaters(modelNames, typeMap, mutationFields, tables){
  for(var i = 0; i < modelNames.length; i++){
    //'user' -> 'User'
    var capitalizedName = modelNames[i].charAt(0).toUpperCase()+modelNames[i].slice(1);
    var updaterName = 'update'+capitalizedName;
    var modelFields = typeMap[modelNames[i]]._fields;

    mutationFields[updaterName] = {
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
      var argsObjSelector = {
        name: "_"+field,
        type: typeMap[modelFields[field].type.name],
        description: null,
        defaultValue: null
      };
      args.push(argsObjSelector);
    }

    mutationFields[updaterName].args = args;
    //console.log(mutationFields[updaterName].args);
    //console.log('mutationFields[updaterName]',mutationFields[updaterName]);

    mutationFields[updaterName].resolve = (root,args)=>{
      //filter out selector from other args
      // console.log('in updateUser');
      var selectorObj = {};
      var updatedObj = {};

      //expect 1 of the underscored vars to be defined. make it selector
      //should work for multiple selectors
      for(var key in args){
        //if(key.charAt(0) === '_' && args[key] !== undefined) selectorObj[key.slice(1)] = args[key];
        if(args[key] !== undefined){
          if(key.charAt(0) === '_') selectorObj[key.slice(1)] = args[key];
          else updatedObj[key] = args[key];
        }
      }
      //rest that are defined and are not _, make them updatedObj
      //TODO: possibly findOne and update
      return tables[capitalizedName].update(
          updatedObj,
          {where:
            selectorObj
          }
        ).then(function(data){
          //do what you want with the returned data
        });
    }
  }
}

module.exports = CreateUpdaters;
