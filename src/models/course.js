module.exports = (sequelize, DataTypes) => {
  const course = sequelize.define('course', {
    name: { type: DataTypes.STRING, allowNull: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true }
  });

  course.associate = models => {
    course.hasMany(models.programCourse);
  };

  return course;
};
