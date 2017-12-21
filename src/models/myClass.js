module.exports = (sequelize, DataTypes) => {
  const myClass = sequelize.define('myClass', {
    term: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.STRING, allowNull: false, validate: { len: [9] } },
    cycle: { type: DataTypes.INTEGER, allowNull: false }
  });

  myClass.associate = models => {
    myClass.belongsTo(models.program);
    myClass.belongsTo(models.programCourse);
    myClass.belongsTo(models.instructor);
    myClass.hasMany(models.myClassStudent);
    myClass.hasMany(models.myClassAssessment);
    myClass.hasMany(models.grade);
  };

  return myClass;
};
