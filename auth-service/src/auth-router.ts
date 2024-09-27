import express from "express"
import { config } from "./config.js";

const authRouter = express.Router()

authRouter.use(express.urlencoded())

authRouter.get("/login", (req, res) => 
    res.redirect(`https://login.microsoftonline.com/${config.MS_TENANT_ID}/oauth2/v2.0/authorize?client_id=${config.MS_CLIENT_ID}&response_type=id_token&redirect_uri=${config.MS_AUTHORIZE_REDIRECT_URI}&response_mode=form_post&scope=openid&nonce=123456`)
)

authRouter.post("/redirect", (req, res) => {
    // TODO validation of token, set expire field to cookie

    const token = req.body.id_token;

    res.cookie("id_token", token)
    res.redirect("/")
})

export { authRouter };