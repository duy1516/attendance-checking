const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('src/swagger.yaml');

const app = express();
const port = 2000;

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
