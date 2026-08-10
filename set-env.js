const fs = require('fs');
require('dotenv').config();

const targetPathDev = './src/environments/environment.development.ts';
const targetPathProd = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  GoogleClient: {
    ClientId: '${process.env.GOOGLE_CLIENT_ID || ''}',
  },
};
`;

fs.mkdirSync('./src/environments', { recursive: true });
fs.writeFileSync(targetPathDev, envConfigFile);
fs.writeFileSync(targetPathProd, envConfigFile);
console.log('Environment files generated correctly.');
