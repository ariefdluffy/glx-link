export function verifyEmailHtml(name: string, verificationUrl: string): string {
	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifikasi Email - GLX Link</title>
</head>
<body style="margin:0;padding:0;background:#0f0f12;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:rgba(24,24,31,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:24px;backdrop-filter:blur(14px);padding:40px 32px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;font-weight:700;color:#f4f4f5;">GLX</span>
              <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;font-weight:300;color:#7c3aed;">Link</span>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:600;color:#f4f4f5;margin:0;">Verifikasi Alamat Email</h1>
            </td>
          </tr>
          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:14px;color:#8b8b94;margin:0;line-height:1.6;">
                Halo <strong style="color:#f4f4f5;">${name}</strong>,<br/>
                Terima kasih telah mendaftar di GLX Link.<br/>
                Klik tombol di bawah untuk memverifikasi email kamu.
              </p>
            </td>
          </tr>
          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${verificationUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#000000;font-size:14px;font-weight:600;padding:14px 36px;border-radius:16px;text-decoration:none;font-family:'Inter',sans-serif;">
                Verifikasi Email
              </a>
            </td>
          </tr>
          <!-- Fallback link -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:12px;color:#8b8b94;margin:0;line-height:1.6;">
                Atau salin link ini ke browser:<br/>
                <span style="color:#7c3aed;font-size:11px;word-break:break-all;">${verificationUrl}</span>
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);"></td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:16px;">
              <p style="font-size:11px;color:#5a5a62;margin:0;line-height:1.5;">
                Link verifikasi berlaku selama 24 jam.<br/>
                Jika kamu tidak mendaftar di GLX Link, abaikan email ini.
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
