// Replacing with sequelize

const Sequelize = require('sequelize');

const sequelize = require('../util/database');


// Definining model using sequelize


const Product = sequelize.define('product',{
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },

  title: Sequelize.STRING,
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  description: {
   type: Sequelize.STRING,
   allowNull: false
  }
})

module.exports = Product;