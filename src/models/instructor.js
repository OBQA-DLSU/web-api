module.exports = (sequelize, DataTypes) => {
  const instructor = sequelize.define('instructor', {
    status: { type: DataTypes.INTEGER, allowNull: true }
  });

  instructor.associate = models => {
    instructor.belongsTo(models.user);
    instructor.belongsTo(models.program);
    instructor.hasMany(models.grade);
    instructor.hasMany(models.myClass);
  };
  
  return instructor;
};
