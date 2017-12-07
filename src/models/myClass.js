module.exports = (sequelize, DataTypes) => {
  const myClass = sequelize.define('myClass', {
    term: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.INTEGER, allowNull: false, validate: { len: [9] } }
  });

  myClass.associate = models => {
    myClass.belongsTo(models.program);
    myClass.belongsTo(models.programCourse);
    myClass.belongsTo(models.instructor);
    myClass.hasMany(models.myClassStudent);
    myClass.hasMany(models.myClassAssessment);
  };

  return myClass;
};
