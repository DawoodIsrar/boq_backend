const express = require("express");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
module.exports = (sequelize, Sequelize, DataTypes) => {
  const users = sequelize.define("users", {
  
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false
    },
    position: {
      type: DataTypes.STRING,
      allowNull:false
    },
    password: {
      type: Sequelize.STRING,
      allowNull:false,
      
    },
    retypePassword:{
      type: Sequelize.STRING,
      allowNull:true,
    },
  },
    {
      createdAt: false,
      updatedAt: false
    }
  );

  return users;
};
