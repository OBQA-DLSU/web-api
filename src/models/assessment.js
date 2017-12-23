module.exports = (sequelize, DataTypes) => {
  const assessment = sequelize.define('assessment', {
    assessmentLevel: { type: DataTypes.INTEGER, allowNull: true},
    assessmentTask: { type: DataTypes.STRING, allowNull: true },
    target: { type: DataTypes.DOUBLE, allowNull: true },
    passingGrade: { type: DataTypes.DOUBLE, allowNull: true },
    performance: { type: DataTypes.DOUBLE, allowNull: true },
    improvementPlan: { type: DataTypes.STRING, allowNull: true },
    term: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.STRING, allowNull: false, validate: { len: [9] } },
    cycle: { type: DataTypes.INTEGER, allowNull: false }
  });

  assessment.associate = models => {
    assessment.belongsTo(models.program);
    assessment.belongsTo(models.programSopi);
    assessment.belongsTo(models.programCourse);
    assessment.hasMany(models.myClassAssessment);
    assessment.hasMany(models.grade);
    assessment.hasMany(models.evidence);
  };

  return assessment;
};
