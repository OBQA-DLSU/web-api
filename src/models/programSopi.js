module.exports = (sequelize, DataTypes) => {
  const programSopi = sequelize.define('programSopi', {
    description: { type: DataTypes.STRING, allowNull: true }
  });

  programSopi.associate = models => {
    programSopi.belongsTo(models.program);
    programSopi.belongsTo(models.sopi);
    programSopi.hasMany(models.grade);
    programSopi.hasMany(models.assessment);
    programSopi.hasMany(models.evidence);
  };

  return programSopi;
};