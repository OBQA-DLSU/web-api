const express = require('express');
const sopiRouter = express.Router();
const Sopi = require('../api/sopi');

sopiRouter.route('/programSopi/:id')
  .get(Sopi.getOneSopi)
  .put(Sopi.updateProgramSopi)
  .delete(Sopi.deleteProgramSopi);

sopiRouter.route('/bulk/:prograId')
  .post(Sopi.bulkCreateProgramSopi)
  .put(Sopi.bulkUpdateProgramSopi)
  .delete(Sopi.bulkDeleteProgramSopi);

sopiRouter.route('/:programId')
  .get(Sopi.getProgramSopi)
  .post(Sopi.createProgramSopi);

module.exports = sopiRouter;
