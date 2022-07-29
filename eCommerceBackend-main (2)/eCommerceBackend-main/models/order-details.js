const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const OrderDetails = sequelize.define('order-details',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
})

module.exports = OrderDetails;