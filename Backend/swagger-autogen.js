const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Preepx API',
    description: 'Auto-generated API documentation for all endpoints',
  },
  host: 'localhost:4000',
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your Bearer token in the format: Bearer <token>'
    }
  }
};

const fs = require('fs');
const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    // Post-process the generated JSON to add automatic tags based on route paths
    try {
        const data = fs.readFileSync(outputFile, 'utf8');
        const swaggerData = JSON.parse(data);
        
        // Loop through all paths
        for (const path in swaggerData.paths) {
            const methods = swaggerData.paths[path];
            
            // Extract the category name from path (e.g., /api/users/... -> Users)
            const parts = path.split('/');
            let category = 'General';
            
            if (parts.length > 2 && parts[1] === 'api') {
                const rawCategory = parts[2];
                // Capitalize first letter
                category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
            }

            for (const method in methods) {
                methods[method].tags = [category];
            }
        }

        // Write the updated data back to the file
        fs.writeFileSync(outputFile, JSON.stringify(swaggerData, null, 2));
        console.log("Swagger JSON generated and grouped successfully!");
    } catch(err) {
        console.error("Error post-processing swagger file:", err);
    }
});
