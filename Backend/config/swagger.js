const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const setupSwagger = (app) => {
  // Check if the generated swagger file exists
  const swaggerFile = path.resolve(__dirname, '../swagger-output.json');
  
  if (fs.existsSync(swaggerFile)) {
    const swaggerDocument = require(swaggerFile);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  } else {
    app.get('/api-docs', (req, res) => {
      res.send(`
        <html>
          <body>
            <h2>Swagger file not found!</h2>
            <p>Please run <code>npm run swagger</code> to generate the API docs.</p>
          </body>
        </html>
      `);
    });
  }
};

module.exports = setupSwagger;
