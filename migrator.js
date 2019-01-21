'use strict'

const { NODE_ENV = 'development' } = process.env;
const DATABASE_CONFIG = require('./config/database.js')[NODE_ENV];
const Sequelize = require('sequelize');
const Umzug = require('umzug');
const path = require('path');

const sequelizeInst = new Sequelize(DATABASE_CONFIG);
const umzug = new Umzug({
  storage: "sequelize",

  storageOptions: {
    sequelize: sequelizeInst
  },

  migrations: {
    params: [
      sequelizeInst.getQueryInterface(),
      Sequelize
    ],
    path: path.join(__dirname, "./migrations")
  }
});

module.exports.main = (event, context, _callback) => {
  console.log(event);
  umzug.
    up().
    then((result) => {
      console.log(`Migration completed: ${JSON.stringify(result)}`)
      context.done();
    }).
    catch (error => {
      console.error(error);
      throw error;
    });
};