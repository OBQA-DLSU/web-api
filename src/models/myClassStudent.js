module.exports = (sequelize, DataTypes) => {
  const myClassStudent = sequelize.define('myClassStudent', {
    status: { type: DataTypes.STRING, allowNull: true, defaultsTo: 'ACTIVE' }
  });

  myClassStudent.associate = models => {
    myClassStudent.belongsTo(models.myClass);
    myClassStudent.belongsTo(models.student);
  };

  return myClassStudent;
};
