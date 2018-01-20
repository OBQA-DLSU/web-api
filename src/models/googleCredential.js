module.exports = (sequelize, DataTypes) => {
  const googleCredential = sequelize.define('googleCredential', {
    access_token: { type: DataTypes.STRING },
    refresh_token: { type: DataTypes.STRING },
    token_type: { type: DataTypes.STRING },
    expiry_date: { type: DataTypes.STRING }
  });

  googleCredential.associate = models => {
    googleCredential.belongsTo(models.program);
  };

  return googleCredential;
};
