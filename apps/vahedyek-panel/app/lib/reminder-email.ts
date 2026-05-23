import nodemailer from 'nodemailer';

export type ReminderEmailDeliveryStatus = 'sent' | 'config_missing' | 'failed';

function readBool(value: string | undefined) {
  return value === '1' || value?.toLowerCase() === 'true';
}

function getReminderEmailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !portRaw || !from) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) return null;

  return {
    host,
    port,
    secure: readBool(process.env.SMTP_SECURE) || port === 465,
    from,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export async function sendReminderEmail(input: {
  to: string;
  subject: string;
  message: string;
}): Promise<ReminderEmailDeliveryStatus> {
  const config = getReminderEmailConfig();
  if (!config) return 'config_missing';

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.message,
      html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9"><h2 style="margin:0 0 12px">${escapeHtml(input.subject)}</h2><p style="margin:0">${escapeHtml(input.message).replace(/\n/g, '<br />')}</p></div>`,
    });

    return 'sent';
  } catch (error) {
    console.error('Reminder email send failed:', error);
    return 'failed';
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
