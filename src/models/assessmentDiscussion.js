module.exports = (sequelize, DataTypes) => {
  const assessmentDiscussion = sequelize.define('assessmentDiscussion', {
    discussion: { type: DataTypes.STRING, allowNull: true }
  });

  assessmentDiscussion.associate = models => {
    assessmentDiscussion.belongsTo(models.assessment);
    assessmentDiscussion.belongsTo(models.instructor);
  };

  return assessmentDiscussion;
};
