import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendMagicLink(email: string, url: string) {
    await transporter.sendMail({
        from: "Esedu <no-reply@esedu.fi>",
        to: email,
        subject: "Your Magic Login Link",
        html: `
      <p>Click below to sign in:</p>
      <p><a href="${url}" style="padding:10px 16px;background:#007bff;color:white;border-radius:5px;text-decoration:none;">Sign in</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    `,
    });
}
