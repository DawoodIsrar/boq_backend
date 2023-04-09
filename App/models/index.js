const config = require("../config/db.config.js");
const {Sequelize, DataTypes, QueryTypes} = require("sequelize");
const msnodesqlv8 = require("msnodesqlv8");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    server: config.SERVER,
    dialect: config.dialect,
    driver:msnodesqlv8,
    // operatorsAliases: false,
    option:{
           trustedConnection: true,
           instanceName: 'SQLEXPRESS'

    },

    // pool: {
    //   max: config.pool.max,
    //   min: config.pool.min,
    //   acquire: config.pool.acquire,
      
    // }
  }
);

const db = {};
module.exports = sequelize;
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require("./users.js")(sequelize, Sequelize,DataTypes,QueryTypes);
db.projects = require('./projects')(sequelize, Sequelize,DataTypes,QueryTypes);
db.material = require('./material')(sequelize, Sequelize,DataTypes,QueryTypes);
//user table
db.users.hasMany(db.projects,{
  foreignKey: "u_id",
})
db.projects.hasMany(db.material,{
  foreignKey:"p_id"
})
module.exports = db;


