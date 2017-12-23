module.exports = (sequelize, DataTypes) => {
  const programCourse = sequelize.define('programCourse', {
    toBeAssessed: { type: DataTypes.BOOLEAN, defaultsTo: false },
    description: { type: DataTypes.STRING, allowNull: true }
  });

  programCourse.associate = models => {
    programCourse.belongsTo(models.program);
    programCourse.belongsTo(models.course);
    programCourse.hasMany(models.grade);
    programCourse.hasMany(models.myClass);
    programCourse.hasMany(models.assessment);
    programCourse.hasMany(models.evidence);
  };

  return programCourse;
}