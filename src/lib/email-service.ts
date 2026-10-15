import nodemailer, { type Transporter } from 'nodemailer'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  simulated?: boolean
  error?: string
}

let transporterInstance: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporterInstance) return transporterInstance

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  // Jika konfigurasi SMTP lengkap
  if (host && user && pass) {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })
    return transporterInstance
  }

  // Jika menggunakan Gmail Service
  if (process.env.SMTP_SERVICE === 'gmail' && user && pass) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    })
    return transporterInstance
  }

  return null
}

/**
 * Mengirimkan email menggunakan SMTP transport atau mode simulasi jika SMTP belum diset
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  const from = process.env.EMAIL_FROM || '"E17 Course" <no-reply@e17course.com>'
  const transporter = getTransporter()

  if (!transporter) {
    // Mode simulasi/fallback jika kredensial SMTP belum dipasang di .env.local
    console.log('[EMAIL SERVICE - SIMULASI] SMTP belum dikonfigurasi di .env.local.')
    console.log(`[EMAIL SERVICE - SIMULASI] Kepada: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
    console.log(`[EMAIL SERVICE - SIMULASI] Subjek: ${options.subject}`)
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    }
  } catch (err: any) {
    console.error('[EMAIL SERVICE] Gagal mengirim email:', err)
    return {
      success: false,
      error: err?.message || 'Gagal mengirim email.',
    }
  }
}

export interface ClassReminderEmailParams {
  recipientName: string
  role: 'mentor' | 'siswa'
  programName: string
  batchName: string
  sessionNumber: number
  sessionTitle: string
  dateFormatted: string
  timeFormatted: string
  sessionType: 'online' | 'offline' | 'hybrid' | string
  meetingLink?: string | null
  dashboardUrl?: string
}

/**
 * Menghasilkan template HTML email pengingat kelas yang profesional dan responsif
 */
export function generateClassReminderEmailHtml(params: ClassReminderEmailParams): string {
  const isMentor = params.role === 'mentor'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const targetDashboardUrl = params.dashboardUrl || (isMentor ? `${appUrl}/mentor` : `${appUrl}/siswa`)
  const isOnline = params.sessionType.toLowerCase() === 'online' || params.sessionType.toLowerCase() === 'hybrid'

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Kelas Hari Ini - E17 Course</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0B0F19 0%, #1e293b 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #f59e0b;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
      color: #334155;
    }
    .greeting strong {
      color: #0f172a;
    }
    .session-card {
      background-color: #fffbeb;
      border: 2px solid #fef3c7;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .program-tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #b45309;
      margin-bottom: 6px;
    }
    .session-title {
      font-size: 20px;
      font-weight: 800;
      color: #78350f;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .info-grid {
      display: table;
      width: 100%;
      border-top: 1px solid #fde68a;
      padding-top: 14px;
    }
    .info-row {
      display: table-row;
    }
    .info-label {
      display: table-cell;
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
      padding: 5px 0;
      width: 120px;
    }
    .info-value {
      display: table-cell;
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      padding: 5px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #f59e0b;
      color: #0f172a !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
      transition: background-color 0.2s;
    }
    .btn-secondary {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 12px;
      margin-left: 10px;
    }
    .tips-box {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 16px 20px;
      border-left: 4px solid #3b82f6;
      margin-bottom: 24px;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }
    .tips-box strong {
      color: #1e3a8a;
      display: block;
      margin-bottom: 4px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #b45309;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">Pengingat Jadwal Kelas</div>
      <h1>Kelas Anda Dimulai Hari Ini!</h1>
    </div>

    <div class="content">
      <p class="greeting">
        Halo <strong>${params.recipientName}</strong>,<br>
        ${
          isMentor
            ? 'Ini adalah pengingat bahwa Anda memiliki sesi mengajar yang dijadwalkan untuk hari ini bersama para peserta kelas Anda.'
            : 'Jangan lewatkan sesi pembelajaran Anda hari ini. Persiapkan perangkat dan pastikan Anda hadir tepat waktu untuk materi berikut:'
        }
      </p>

      <div class="session-card">
        <div class="program-tag">${params.programName} • ${params.batchName}</div>
        <h2 class="session-title">Sesi ${params.sessionNumber}: ${params.sessionTitle}</h2>
        
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Tanggal:</div>
            <div class="info-value">${params.dateFormatted}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Waktu:</div>
            <div class="info-value">${params.timeFormatted}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Metode:</div>
            <div class="info-value">${params.sessionType.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div class="btn-container">
        ${
          isOnline && params.meetingLink
            ? `<a href="${params.meetingLink}" target="_blank" class="btn-primary">Gabung Ruang Kelas Online</a>`
            : ''
        }
        <a href="${targetDashboardUrl}" target="_blank" class="btn-secondary">Buka Dashboard LMS</a>
      </div>

      <div class="tips-box">
        <strong>Tips Persiapan Kelas:</strong>
        ${
          isMentor
            ? 'Pastikan materi presentasi dan tautan ruang rapat (Zoom/Meet) telah aktif setidaknya 10 menit sebelum jam mulai sesi.'
            : 'Pastikan koneksi internet stabil, siapkan catatan, dan masuk ke ruang kelas 5-10 menit sebelum kelas dimulai.'
        }
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">Email ini dikirim secara otomatis oleh sistem <strong>E17 Course LMS</strong>.</p>
      <p style="margin: 0;">Ada pertanyaan? Hubungi admin melalui <a href="mailto:support@e17course.com">support@e17course.com</a> atau WhatsApp Resmi.</p>
    </div>
  </div>
</body>
</html>
`
}
