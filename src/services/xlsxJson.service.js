const Bluebird = require('bluebird');
const xlsxj = require('xlsx-to-json');
const path = require('path');
const ErrorMessageService = require('./errorMessage.service');
Bluebird.promisifyAll(xlsxj);

module.exports = {
  parseXlsx: (file) => {
    return new Promise((resolve, reject) => {
      Bluebird.promisifyAll(file('file'));
      file('file').upload(uploadedFiles => {
        if (path.extname(uploadedFiles[0].filename) !== '.xls' && path.extname(uploadedFiles[0].filename) !== '.xlsx') {
          reject(ErrorMessageService.customError(`There is an error in parsing xls/ xlsx files.`));
        }
        const fd = uploadedFiles[0].fd;
        xlsxj({input: fd})
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
      })
    });
  }
};