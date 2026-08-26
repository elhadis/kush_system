import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface WelcomeEmailPayload {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}

export interface SendEmailResult {
  sent: boolean;
  mode: "resend" | "smtp" | "ethereal";
  message?: string;
  previewUrl?: string;
}

function buildWelcomeHtml({
  name,
  email,
  password,
  loginUrl,
}: WelcomeEmailPayload): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to NAS ERP</title>
</head>
<body style="margin:0;padding:0;background:#0b0f12;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0f12;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#111820;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;background:linear-gradient(135deg,#7f1d1d 0%,#10b981 100%);">
              <h1 style="margin:0;font-size:22px;color:#ffffff;">Welcome to NAS ERP</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Your account has been created</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello <strong>${escapeHtml(name)}</strong>,</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#94a3b8;">
                An administrator has created your NAS ERP account. Use the credentials below to sign in.
                You will be asked to change your password on first login.
              </p>
              <table role="presentation" width="100%" style="background:#0b0f12;border:1px solid #1e293b;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Email</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#e2e8f0;"><code style="font-family:ui-monospace,monospace;">${escapeHtml(email)}</code></p>
                    <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Temporary Password</p>
                    <p style="margin:0;font-size:14px;color:#10b981;"><code style="font-family:ui-monospace,monospace;">${escapeHtml(password)}</code></p>
                  </td>
                </tr>
              </table>
              <a href="${escapeHtml(loginUrl)}"
                 style="display:inline-block;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg,#7f1d1d 0%,#10b981 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                Sign in to NAS ERP
              </a>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
                If you did not expect this email, please contact your administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const globalMail = globalThis as typeof globalThis & {
  __nasSmtpTransporter?: Transporter;
  __nasEtherealAccount?: { user: string; pass: string };
};

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

async function getSmtpTransporter(): Promise<{
  transporter: Transporter;
  mode: "smtp" | "ethereal";
}> {
  if (globalMail.__nasSmtpTransporter && hasSmtpConfig()) {
    return { transporter: globalMail.__nasSmtpTransporter, mode: "smtp" };
  }

  if (hasSmtpConfig()) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.info(
      `[welcome-email] Using SMTP transport ${process.env.SMTP_HOST}:${port}`
    );
    globalMail.__nasSmtpTransporter = transporter;
    return { transporter, mode: "smtp" };
  }

  // Dev fallback: Ethereal captures mail and provides a preview URL
  if (!globalMail.__nasEtherealAccount) {
    console.info("[welcome-email] No SMTP/Resend configured — creating Ethereal test account…");
    const account = await nodemailer.createTestAccount();
    globalMail.__nasEtherealAccount = {
      user: account.user,
      pass: account.pass,
    };
    console.info(`[welcome-email] Ethereal user: ${account.user}`);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: globalMail.__nasEtherealAccount,
  });

  return { transporter, mode: "ethereal" };
}

async function sendViaResend(
  payload: WelcomeEmailPayload,
  html: string,
  subject: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from =
    process.env.EMAIL_FROM ?? "NAS ERP <onboarding@resend.dev>";

  console.info(`[welcome-email] Sending via Resend → ${payload.email}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[welcome-email] Resend failed:", detail);
    return {
      sent: false,
      mode: "resend",
      message: `Resend delivery failed: ${detail.slice(0, 200)}`,
    };
  }

  const data = (await res.json()) as { id?: string };
  console.info(`[welcome-email] Resend OK id=${data.id ?? "unknown"} → ${payload.email}`);
  return { sent: true, mode: "resend", message: "Welcome email sent via Resend" };
}

async function sendViaNodemailer(
  payload: WelcomeEmailPayload,
  html: string,
  subject: string
): Promise<SendEmailResult> {
  const { transporter, mode } = await getSmtpTransporter();
  const from =
    process.env.EMAIL_FROM ??
    (mode === "ethereal"
      ? `"NAS ERP" <${globalMail.__nasEtherealAccount?.user}>`
      : `"NAS ERP" <${process.env.SMTP_USER}>`);

  console.info(
    `[welcome-email] Sending via ${mode.toUpperCase()} → ${payload.email}`
  );

  const info = await transporter.sendMail({
    from,
    to: payload.email,
    subject,
    html,
    text: [
      `Hello ${payload.name},`,
      "",
      "Your NAS ERP account has been created.",
      `Email: ${payload.email}`,
      `Temporary password: ${payload.password}`,
      `Login: ${payload.loginUrl}`,
      "",
      "You must change your password on first login.",
    ].join("\n"),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

  if (previewUrl) {
    console.info(`[welcome-email] Ethereal preview URL: ${previewUrl}`);
  }

  console.info(
    `[welcome-email] ${mode.toUpperCase()} OK messageId=${info.messageId} → ${payload.email}`
  );

  return {
    sent: true,
    mode,
    message:
      mode === "ethereal"
        ? "Welcome email sent to Ethereal test inbox (check server logs for preview URL)"
        : "Welcome email sent via SMTP",
    previewUrl,
  };
}

/**
 * Sends a welcome email with credentials.
 * Priority: Resend → SMTP env → Ethereal (dev preview).
 * Never silently succeeds without attempting delivery.
 */
export async function sendWelcomeEmail(
  payload: WelcomeEmailPayload
): Promise<SendEmailResult> {
  console.info("[welcome-email] sendWelcomeEmail() called", {
    to: payload.email,
    name: payload.name,
    loginUrl: payload.loginUrl,
  });

  const html = buildWelcomeHtml(payload);
  const subject = "Welcome to NAS ERP — Your account credentials";

  try {
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(payload, html, subject);
    }

    return await sendViaNodemailer(payload, html, subject);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email transport error";
    console.error("[welcome-email] FAILED:", message, error);
    return {
      sent: false,
      mode: process.env.RESEND_API_KEY
        ? "resend"
        : hasSmtpConfig()
          ? "smtp"
          : "ethereal",
      message: `Failed to send welcome email: ${message}`,
    };
  }
}
