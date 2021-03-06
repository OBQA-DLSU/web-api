module.exports = (sequelize, DataTypes) => {
  const evidence = sequelize.define('evidence', {
    name: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING },
    mimeType: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING, enum:['MIN', 'MAX', 'MED'] }
  });

  evidence.associate = models => {
    evidence.belongsTo(models.program);
    evidence.belongsTo(models.assessment);
    evidence.belongsTo(models.myClass);
    evidence.belongsTo(models.programCourse);
    evidence.belongsTo(models.programSopi);
  };

  return evidence;
};
