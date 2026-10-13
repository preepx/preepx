const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const setupSwagger = (app) => {
  // Check if the generated swagger file exists
  const swaggerFile = path.resolve(__dirname, '../swagger-output.json');

  const bypassCsp = (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    next();
  };

  if (fs.existsSync(swaggerFile)) {
    const swaggerDocument = require(swaggerFile);

    // Set host to live production API host so Swagger executes on api.preepx.in
    swaggerDocument.host = process.env.SWAGGER_HOST || 'api.preepx.in';
    swaggerDocument.schemes = ['https', 'http'];

    // Sanitize any accidental "validate(req" glitch parameters from swagger-autogen
    if (swaggerDocument.paths) {
      for (const path in swaggerDocument.paths) {
        const methods = swaggerDocument.paths[path];
        for (const method in methods) {
          if (methods[method].parameters && Array.isArray(methods[method].parameters)) {
            methods[method].parameters = methods[method].parameters.filter(
              (p) => !p.name || (!p.name.includes('validate(') && !p.name.includes('('))
            );
            methods[method].parameters.forEach((p) => {
              if (p.schema && p.schema.properties) {
                delete p.schema.properties['validate(req'];
              }
            });
          }
        }
      }
    }

    app.use('/api-docs', bypassCsp, swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
    app.use('/api/api-docs', bypassCsp, swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  } else {
    const notFound = (req, res) => {
      res.send(`
        <html>
          <body>
            <h2>Swagger file not found!</h2>
            <p>Please run <code>npm run swagger</code> to generate the API docs.</p>
          </body>
        </html>
      `);
    };
    app.get('/api-docs', notFound);
    app.get('/api/api-docs', notFound);
  }
};

module.exports = setupSwagger;
