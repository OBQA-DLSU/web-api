module.exports = (sequelize, DataTypes) => {
  const improvementPlanSuggestion = sequelize.define('improvementPlanSuggestion', {
    suggestion: { type: DataTypes.STRING, allowNull: true }
  });

  improvementPlanSuggestion.associate = models => {
    improvementPlanSuggestion.belongsTo(models.assessment);
    improvementPlanSuggestion.belongsTo(models.instructor);
  };

  return improvementPlanSuggestion;
};
