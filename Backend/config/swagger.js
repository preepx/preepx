const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const setupSwagger = (app) => {
  // Check if the generated swagger file exists
  const swaggerFile = path.resolve(__dirname, '../swagger-output.json');

  const bypassCsp = (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  };

  if (fs.existsSync(swaggerFile)) {
    const swaggerDocument = require(swaggerFile);

    // Set host to live production API host so Swagger executes on api.preepx.in
    swaggerDocument.host = process.env.SWAGGER_HOST || 'api.preepx.in';
    swaggerDocument.schemes = ['https', 'http'];

    // Sanitize any accidental "validate(req" glitch parameters from swagger-autogen
    if (swaggerDocument.paths) {
      for (const p in swaggerDocument.paths) {
        const methods = swaggerDocument.paths[p];
        for (const method in methods) {
          if (methods[method].parameters && Array.isArray(methods[method].parameters)) {
            methods[method].parameters = methods[method].parameters.filter(
              (param) => !param.name || (!param.name.includes('validate(') && !param.name.includes('('))
            );
            methods[method].parameters.forEach((param) => {
              if (param.schema && param.schema.properties) {
                delete param.schema.properties['validate(req'];
              }
            });
          }
        }
      }
    }

    // Generate base HTML
    const rawHtml = swaggerUi.generateHTML(swaggerDocument, { explorer: true });

    // Inline swagger-ui-init.js directly into HTML so Cloudflare/browser edge caches NEVER serve old localhost:4000
    const inlineInitCode = `
window.onload = function() {
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
    swaggerDoc: ${JSON.stringify(swaggerDocument)}
  };
  var swaggerOptions = {
    spec: options.swaggerDoc,
    url: url,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  };
  window.ui = SwaggerUIBundle(swaggerOptions);
};
`;

    const htmlWithInlineInit = rawHtml.replace(
      /<script src="\.\/swagger-ui-init\.js">\s*<\/script>/,
      `<script>${inlineInitCode}</script>`
    );

    const serveSwaggerHtml = (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(htmlWithInlineInit);
    };

    const serveInitJs = (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "application/javascript");
      res.send(inlineInitCode);
    };

    // Explicitly handle swagger-ui-init.js with no-cache in case it is requested
    app.get('/api-docs/swagger-ui-init.js', bypassCsp, serveInitJs);
    app.get('/api/api-docs/swagger-ui-init.js', bypassCsp, serveInitJs);

    // Serve HTML page
    app.get('/api-docs', bypassCsp, serveSwaggerHtml);
    app.get('/api/api-docs', bypassCsp, serveSwaggerHtml);

    // Serve static assets (CSS, JS bundles, icons)
    app.use('/api-docs', bypassCsp, swaggerUi.serve);
    app.use('/api/api-docs', bypassCsp, swaggerUi.serve);
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
