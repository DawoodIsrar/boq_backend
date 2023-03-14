const express = require("express");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
module.exports = (sequelize, Sequelize, DataTypes) => {
  const materials = sequelize.define("materials", {
     project_name:{
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
      type: Sequelize.INTEGER,
      allowNull:false,
      
    },
    attach_bath:{
      type: Sequelize.BOOLEAN,
      allowNull:true,
    },
    attach_bath_size:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      kitchen:{
        type: Sequelize.BOOLEAN,
        allowNull:true,
      },
      kitchen_size:{
          type: Sequelize.FLOAT,
          allowNull:true,
        },
      total_bricks:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      total_cement:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      total_beams_pillars:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      total_steel:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      total_sand:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
      total_concrete:{
        type: Sequelize.FLOAT,
        allowNull:true,
      },
  },
    {
      createdAt: false,
      updatedAt: false
    }
  );

  return materials;
};
