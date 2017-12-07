module.exports = (sequelize, DataTypes) => {
  const myClassAssessment = sequelize.define('myClassAssessment', {});
  myClassAssessment.associate = models => {
    myClassAssessment.belongsTo(models.myClass);
    myClassAssessment.belongsTo(models.assessment);
  };
  return myClassAssessment;
};