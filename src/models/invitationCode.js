const CodeGenerator = require('node-code-generator');
const generator = new CodeGenerator();
const pattern = '*********';

module.exports = (sequelize, DataTypes) => {

  const invitationCode = sequelize.define('invitationCode', {
    code: { type: DataTypes.STRING, allowNull: false },
    invitationCode: { type: DataTypes.STRING, allowNull: true }
  });

  invitationCode.beforeSave(invitationCode => {
    // Generate an array of random unique codes according to the provided pattern: 
    const codes = generator.generateCodes(pattern, 1);
    invitationCode.invitationCode = codes[0];
  });

  return invitationCode;
};
