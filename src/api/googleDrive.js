var google = require('googleapis');
var fs = require('fs');

exports.fileList = (req, res, next) => {
  const token = req.googleAuth;
  const service = google.drive('v3');
  service.files.list({
    auth: token,
    pageSize: 10,
    fields: "nextPageToken, files(id, name)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      res.status(400).send(err);
      return;
    }
    var files = response.files;
    res.status(200).send(files);
  });
};

exports.saveFile = (req, res, next) => {
  const token = req.googleAuth;
  const drive = google.drive('v3');

  drive.files.create({
    auth: token,
    resource: {
      name: req.file.originalname,
      mimeType: req.file.mimetype
    },
    media: {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.destination + req.file.originalname)
    }
  }, function (err, response){
    if (err) {
      fs.unlinkSync(req.file.destination + req.file.originalname);
      console.log(err);
      res.status(400).send(err);
      return;
    }
    fs.unlinkSync(req.file.destination + req.file.originalname);
    console.log(response);
    res.status(200).send(response);
  });
};
