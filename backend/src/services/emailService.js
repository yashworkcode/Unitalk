import nodemailer from 'nodemailer'

let transporter = null
function getTransporter() {
  if (transporter) return transporter
  if (!process.env.SMTP_HOST) return null
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  return transporter
}

export async function sendPasswordResetEmail(toEmail, resetToken) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const link = `${appUrl.replace(/\/$/, '')}/reset-password/${resetToken}`
  const client = getTransporter()

  if (!client) {
    // No SMTP configured - print to the server console so local dev still works end to end.
    console.log('\n[email] SMTP not configured - password reset link (dev mode):')
    console.log(`[email]   to: ${toEmail}`)
    console.log(`[email]   link: ${link}\n`)
    return
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || 'UniTalk <no-reply@unitalk.app>',
    to: toEmail,
    subject: 'Reset your UniTalk password',
    text: `We received a request to reset your UniTalk password. Open this link to choose a new one (valid for 1 hour):\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `<p>We received a request to reset your UniTalk password.</p><p><a href="${link}">Click here to choose a new password</a> (valid for 1 hour).</p><p>If you didn't request this, you can safely ignore this email.</p>`,
  })
}
