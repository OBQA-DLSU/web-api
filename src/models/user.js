const bcrypt = require('bcrypt-nodejs');
module.exports = (sequelize, DataTypes) => {
  let programId;
  const user = sequelize.define('user', {
    idNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    fname: { type: DataTypes.STRING, allowNull: true },
    lname: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultsTo: 'ACTIVE'},
    password: DataTypes.STRING
  });

  user.associate = models => {
    user.hasMany(models.instructor);
    user.hasMany(models.student);
    user.belongsTo(models.role);
  };
  user.beforeSave(user => {
    console.log(user);
    if (user.email && user.password) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.password, salt);
    } else {
      throw new Error('Please check your password');
    }
  });
  return user;
};
