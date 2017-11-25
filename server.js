const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

const morgan = require('morgan');
const cors = require('cors');

const apiRoutes = require('./src/router');

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:"application/vmd.api+json"}));

apiRoutes(app);

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
