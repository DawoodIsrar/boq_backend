
const YAML = require('yamljs')
const swaggerJsdoc = YAML.load('api.yaml')
const swaggerUI = require('swagger-ui-express');
const swaggerOption = {
   
  };
  
   module.exports={
   swagggerServe:swaggerUI.serve,
   swaggerSetup:swaggerUI.setup(swaggerJsdoc,swaggerOption)
   }