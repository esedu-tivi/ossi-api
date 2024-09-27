import 'dotenv/config'

const config = {
    MS_TENANT_ID: process.env.MS_TENANT_ID,
    MS_CLIENT_ID: process.env.MS_CLIENT_ID,
    MS_AUTHORIZE_REDIRECT_URI: process.env.MS_AUTHORIZE_REDIRECT_URI
}

export { config }