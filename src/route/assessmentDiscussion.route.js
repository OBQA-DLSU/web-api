const express = require('express');
const assessmentDiscussionRouter = express.Router();
const AssessmentDiscussion = require('../api/assessmentDiscussion');

assessmentDiscussionRouter.route('/assessment/:assessmentId')
.get(AssessmentDiscussion.getAssessmentDiscussion)
.post(AssessmentDiscussion.createAssessmentDiscussion)

assessmentDiscussionRouter.route('/:id')
.get(AssessmentDiscussion.getOneAssessmentDiscussion)
.put(AssessmentDiscussion.updateAssessmentDiscussion)
.delete(AssessmentDiscussion.deleteAssessmentDiscussion)

module.exports = assessmentDiscussionRouter;
