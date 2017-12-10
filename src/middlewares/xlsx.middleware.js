const xlsxj = require("xlsx-2-json");
const fs = require('fs');

exports.parseXLSX = function(req, res, next) {
  if (!req.file) { res.status(400).send({errorMessage: `The file is corrupted or unsupported.`}); return; }
  xlsxj({
    input: req.file.path,
    output: null
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      try {
        fs.unlinkSync(req.file.path);
        console.log(result);
        req.payload = result;
        next();
      }
      catch(e) {
        res.status(500).send({errorMessage: 'Problem deleting the file.'})
      }
    }
  });
};