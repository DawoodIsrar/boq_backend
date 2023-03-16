const express = require("express");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
module.exports = (sequelize, Sequelize, DataTypes) => {
  const materials = sequelize.define("materials", {
    roof_no: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    area:{
      type:DataTypes.FLOAT,
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
          allowNull:true,
        },
      total_bricks:{
        type: DataTypes.FLOAT,
        allowNull:false,
      },
      total_cement:{
        type: DataTypes.FLOAT,
        allowNull:false,
      },
      total_beams_pillars:{
        type: DataTypes.FLOAT,
        allowNull:false,
      },
      total_steel:{
        type: DataTypes.FLOAT,
        allowNull:false,
      },
      total_sand:{
        type: DataTypes.FLOAT,
        allowNull:false,
      },
      total_concrete:{
        type: DataTypes.FLOAT,
        allowNull:false,
      }
      
  },
    {
      createdAt: false,
      updatedAt: false
    }
  );

  return materials;
};
