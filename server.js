const express = require('express');
require('express-async-errors');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const db = require('./src/models');
const apiRoutes = require('./src/router');
const morgan = require('morgan');
const cors = require('cors');


app.use(morgan('combined'));
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:"application/vmd.api+json"}));

apiRoutes(app);

db.sequelize.sync()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });
})
.catch(function (err) {
  console.log(err);
});
