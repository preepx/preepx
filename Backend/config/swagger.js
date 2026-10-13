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
    const rawSwaggerDocument = require(swaggerFile);

    // Sanitize any accidental "validate(req" glitch parameters from swagger-autogen
    if (rawSwaggerDocument.paths) {
      for (const path in rawSwaggerDocument.paths) {
        const methods = rawSwaggerDocument.paths[path];
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

    const getDynamicDoc = (req) => {
      const forwardedHost = req.get('x-forwarded-host');
      const host = forwardedHost || req.get('host') || 'api.preepx.in';
      const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' || host.includes('preepx.in');
      return {
        ...rawSwaggerDocument,
        host: host,
        schemes: [isHttps ? 'https' : 'http']
      };
    };

    const serveDynamicSwagger = (req, res, next) => {
      const dynamicDoc = getDynamicDoc(req);
      swaggerUi.setup(dynamicDoc, { explorer: true })(req, res, next);
    };

    app.use('/api-docs', bypassCsp, swaggerUi.serve, serveDynamicSwagger);
    app.use('/api/api-docs', bypassCsp, swaggerUi.serve, serveDynamicSwagger);
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
