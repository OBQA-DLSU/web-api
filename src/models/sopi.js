module.exports = (sequelize, DataTypes) => {
  const sopi = sequelize.define('sopi', {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true }
  });

  sopi.associate = models => {
    sopi.belongsTo(models.so);
    sopi.hasMany(models.programSopi);
  };

  return sopi;
};
