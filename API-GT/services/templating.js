'use strict'

var fs = require('fs');

module.exports.fillTemplate = function(parameters,templatePath,callback)
{
    
    fs.readFile(templatePath, 'utf8', function(err, template) {          
        
        if(err) {callback(err); return;};
                
        for (var i=0 ; i<parameters.length ; i++)            
            template = template.replace(parameters[i].placeholder,parameters[i].value);        
    
        callback(null,template);

    });        
}