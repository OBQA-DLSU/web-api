module.exports = (sequelize, DataTypes) => {
  const program = sequelize.define('program', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true }
  });
  program.associate = models => {
    program.hasMany(models.student);
    program.hasMany(models.instructor);
    program.hasMany(models.programCourse);
    program.hasMany(models.programSopi);
    program.hasMany(models.myClass);
  };
  return program;
};