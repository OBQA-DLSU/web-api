const express = require('express');
const improvementPlanSuggestionRouter = express.Router();
const ImprovementPlanSuggestion = require('../api/improvementPlanSuggestion');

improvementPlanSuggestionRouter.route('/assessment/:assessmentId')
.get(ImprovementPlanSuggestion.getImprovementPlanSuggestion)
.post(ImprovementPlanSuggestion.createImprovementPlanSuggestion)

improvementPlanSuggestionRouter.route('/:id')
.get(ImprovementPlanSuggestion.getOneImprovementPlanSuggestion)
.put(ImprovementPlanSuggestion.updateImprovementPlanSuggestion)
.delete(ImprovementPlanSuggestion.deleteImprovementPlanSuggestion)

module.exports = improvementPlanSuggestionRouter;
