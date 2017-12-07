module.exports = (sequelize, DataTypes) => {
  const so = sequelize.define('so', {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true }
  });

  so.associate = models => {
    so.hasMany(models.sopi);
  };

  return so;
};
