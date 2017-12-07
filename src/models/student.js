module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define('student', {
    status: { type: DataTypes.STRING, allowNull: true }
  });
  student.associate = models => {
    student.belongsTo(models.user);
    student.belongsTo(models.program);
    student.hasMany(models.myClassStudent);
    student.hasMany(models.grade);
  };
  return student;
};
