module.exports = (sequelize, DataTypes) => {
  const grade = sequelize.define('grade', {
    grade: { type: DataTypes.DOUBLE, allowNull: false, validate: { max: 1 } },
    term: { type: DataTypes.INTEGER, allowNull: false },
    cycle: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.STRING, allowNull: false, validate: { len: [9] } }
  });

  grade.associate = models => {
    grade.belongsTo(models.student);
    grade.belongsTo(models.instructor);
    grade.belongsTo(models.programCourse);
    grade.belongsTo(models.programSopi);
    grade.belongsTo(models.assessment);
  }

  return grade;
};