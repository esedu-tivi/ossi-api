import 'dotenv/config'

const config = { 
    MS_TENANT_ID: process.env.MS_TENANT_ID ?? "",
    MS_CLIENT_ID: process.env.MS_CLIENT_ID ?? "",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "production",
}

export { config }
