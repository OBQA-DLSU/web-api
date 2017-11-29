module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    accessLevel: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true }
  });
  role.associate = models => {
    role.hasMany(models.user);
  };
  return role;
};
