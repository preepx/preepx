/**
 * Recruiter Email Layout Utility
 * Provides a responsive, card-based email wrapper matching the PreepX Recruiter branding.
 */

const { DEFAULT_LOGO_URL, FALLBACK_SUPPORT_EMAIL } = require("../constants/billingNotifications.constants");

const renderRecruiterEmailLayout = ({
  title,
  subtitle,
  headerGradient = "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #1d4ed8 100%)",
  contentHtml,
  ctaText,
  ctaUrl,
  ctaBg = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  frontendUrl = "https://preepx.in",
}) => {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:28px 12px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f1f5f9; color:#0f172a; line-height:1.5;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 12px 30px -8px rgba(15,23,42,0.08);">
    
    <!-- Top Branded Header -->
    <tr>
      <td style="background:${headerGradient}; padding:28px 32px; color:#ffffff;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <!-- Official PreepX Logo inside Crisp White Badge -->
              <div style="margin-bottom:14px;">
                <a href="${frontendUrl}" target="_blank" style="text-decoration:none; display:inline-block;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.12);">
                    <tr>
                      <td style="padding:6px 14px; vertical-align:middle;">
                        <img 
                          src="${DEFAULT_LOGO_URL}" 
                          alt="PreepX" 
                          height="26" 
                          style="height:26px; width:auto; max-height:26px; display:block; border:0; outline:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:18px; font-weight:700; color:#2563eb;" 
                        />
                      </td>
                    </tr>
                  </table>
                </a>
              </div>
              <h1 style="margin:0 0 6px; font-size:20px; font-weight:700; color:#ffffff; line-height:1.3; letter-spacing:-0.2px;">${title}</h1>
              ${subtitle ? `<p style="margin:0; font-size:13.5px; color:#e0e7ff; line-height:1.4;">${subtitle}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content Area -->
    <tr>
      <td style="padding:28px 32px;">
        ${contentHtml}

        ${
          ctaText && ctaUrl
            ? `
        <div style="margin:30px 0 12px; text-align:center;">
          <a href="${ctaUrl}" style="display:inline-block; background:${ctaBg}; color:#ffffff; text-decoration:none; font-weight:600; font-size:14.5px; padding:12px 32px; border-radius:8px; box-shadow:0 4px 14px rgba(37,99,235,0.3); letter-spacing:-0.1px;">
            ${ctaText} &rarr;
          </a>
        </div>
        `
            : ""
        }
      </td>
    </tr>

    <!-- Clean Corporate Footer -->
    <tr>
      <td style="background:#f8fafc; border-top:1px solid #f1f5f9; padding:20px 32px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p style="margin:0 0 6px;">
          Have billing questions or need assistance? Reach out to our hiring team at 
          <a href="mailto:${FALLBACK_SUPPORT_EMAIL}" style="color:#2563eb; text-decoration:none; font-weight:600;">${FALLBACK_SUPPORT_EMAIL}</a>
        </p>
        <p style="margin:0;">&copy; ${currentYear} PreepX Technologies. All rights reserved.</p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
};

module.exports = {
  renderRecruiterEmailLayout,
};
