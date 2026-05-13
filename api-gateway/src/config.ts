import 'dotenv/config'


 function validateEnv(required: readonly string[]): void {
  const missing = required.filter(key => !(key in process.env) || !process.env[key]);
  if (missing.length > 0) {
    console.error(
      'Missing required environment variables',
      missing.join(', ')
    );
    console.error(
      'Check your .env file.'
    );
    throw new Error('Missing required environment variables: ' + missing.join(', '));
  }
}

validateEnv([
  'JWT_SECRET_KEY'
]);


const config = { 
    MS_TENANT_ID: process.env.MS_TENANT_ID ?? "",
    MS_CLIENT_ID: process.env.MS_CLIENT_ID ?? "",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "production",
}

export { config }
