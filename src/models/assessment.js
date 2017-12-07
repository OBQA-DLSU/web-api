module.exports = (sequelize, DataTypes) => {
  const assessment = sequelize.define('assessment', {
    assessmentLevel: { type: DataTypes.INTEGER, allowNull: false },
    assessmentTask: { type: DataTypes.STRING, allowNull: false },
    target: { type: DataTypes.DOUBLE, allowNull: false },
    passingGrade: { type: DataTypes.DOUBLE, allowNull: false },
    performance: { type: DataTypes.DOUBLE, allowNull: true },
    improvementPlan: { type: DataTypes.STRING, allowNull: true },
    term: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.INTEGER, allowNull: false, validate: { len: [9] } }
  });

  assessment.associate = models => {
    assessment.belongsTo(models.programSopi);
    assessment.belongsTo(models.programCourse);
    assessment.hasMany(models.myClassAssessment);
    assessment.hasMany(models.grade);
  };

  return assessment;
};
