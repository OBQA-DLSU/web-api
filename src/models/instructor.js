module.exports = (sequelize, DataTypes) => {
  const instructor = sequelize.define('instructor', {
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'ACTIVE' }
  });

  instructor.associate = models => {
    instructor.belongsTo(models.user);
    instructor.belongsTo(models.program);
    instructor.hasMany(models.grade);
    instructor.hasMany(models.myClass);
  };
  
  return instructor;
};
