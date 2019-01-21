'use strict';
module.exports = (sequelize, DataTypes) => {
  const Domain = sequelize.define('Domain', {
    host: DataTypes.STRING
  }, {});
  Domain.associate = function(models) {
    // associations can be defined here
  };
  return Domain;
};