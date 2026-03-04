import nodemailer from 'nodemailer'

// Create reusable transporter (Brevo SMTP)
// .env: SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587, SMTP_SECURE=false
//       SMTP_USER=<brevo-account-email>, SMTP_PASS=<brevo-smtp-key>
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Send single email
export async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter()

  const mailOptions = {
    from: `"DJYoungster" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  }

  return transporter.sendMail(mailOptions)
}

// Send newsletter to multiple subscribers
export async function sendNewsletter({ subscribers, subject, html }) {
  const transporter = createTransporter()
  const results = {
    sent: 0,
    failed: 0,
    errors: []
  }

  // Send emails in batches to avoid rate limiting
  const batchSize = 10
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)

    const promises = batch.map(async (subscriber) => {
      try {
        // Replace {{EMAIL}} placeholder with actual subscriber email for unsubscribe link
        const personalizedHtml = html.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(subscriber.email))

        await transporter.sendMail({
          from: `"DJYoungster" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject,
          html: personalizedHtml
        })
        results.sent++
      } catch (error) {
        results.failed++
        results.errors.push({ email: subscriber.email, error: error.message })
        console.error(`Failed to send to ${subscriber.email}:`, error.message)
      }
    })

    await Promise.all(promises)

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < subscribers.length) {
      await delay(100)
    }
  }

  return results
}

// Verify SMTP connection
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
