const bcrypt = require('bcrypt-nodejs');
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    idNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    fname: { type: DataTypes.STRING, allowNull: true },
    lname: { type: DataTypes.STRING, allowNull: true },
    encryptedPassword: DataTypes.STRING
  });

  user.associate = models => {
    user.hasMany(models.instructor);
    user.hasMany(models.student);
    user.belongsTo(models.role);
  };
  
  user.beforeSave(user => {
    if (user.email && user.password) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.password, salt);
    }
  });
  return user;
};
