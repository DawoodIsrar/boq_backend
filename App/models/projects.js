const express = require("express");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
module.exports = (sequelize, Sequelize, DataTypes) => {
  const projects = sequelize.define("projects", {
     name:{
      type:DataTypes.STRING,
      allowNull:false
     },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    no_of_roofs: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    rooms: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      avg_room_size: {
        type: DataTypes.INTEGER,
        allowNull:false,
        
      },
      attach_bath:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
      },
      attach_bath_size:{
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        kitchen:{
          type: DataTypes.BOOLEAN,
          allowNull:false,
        },
        kitchen_size:{
            type: DataTypes.FLOAT,
            allowNull:false,
          }
         
        },
 {
      createdAt: false,
      updatedAt: false
    }

  );

  return projects;
};
