const { Resend } = require("resend");

/**
 * Controller to handle candidate feedback and support queries via Resend
 */
exports.sendFeedback = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      examTopic,
      interviewRole,
      score,
      accuracy,
      examId,
      source,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your name." });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your email." });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your message." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[FEEDBACK] Resend API Key is missing in environment variables.");
      return res.status(500).json({ success: false, message: "Email service is temporarily unavailable." });
    }

    const resend = new Resend(apiKey);
    const toEmail = process.env.FEEDBACK_TO_EMAIL || "contact@preepx.in";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "PreepX <contact@preepx.in>";
    
    let headerTitle = "PreepX Feedback";
    let headerSubtitle = "New candidate feedback received from PreepX";

    if (source === "chatbot_support") {
      headerTitle = "PreepX Support & User Inquiry";
      headerSubtitle = "New inquiry submitted via PreepX AI Concierge / Support";
    } else if (source === "enterprise_sales" || source === "contact_sales") {
      headerTitle = "PreepX Enterprise Sales Inquiry";
      headerSubtitle = "New sales inquiry submitted for PreepX Enterprise Plan";
    } else if (source === "interview_result") {
      headerTitle = "PreepX Mock Interview Feedback";
      headerSubtitle = "New candidate feedback received from Mock Interview Results";
    } else if (examTopic) {
      headerTitle = "PreepX Objective Exam Feedback";
      headerSubtitle = "New candidate feedback received from Objective Exam Result";
    }

    let defaultSubject = `PreepX Feedback from ${name.trim()}`;
    if (source === "chatbot_support") {
      defaultSubject = `PreepX Support Query from ${name.trim()}`;
    } else if (source === "enterprise_sales" || source === "contact_sales") {
      defaultSubject = `PreepX Enterprise Sales Inquiry from ${name.trim()}`;
    } else if (source === "interview_result") {
      defaultSubject = `PreepX Interview Feedback - ${interviewRole || examTopic || "Mock Interview"}`;
    } else if (examTopic) {
      defaultSubject = `PreepX Objective Exam Feedback - ${examTopic}`;
    }

    const emailSubject = subject && subject.trim() ? subject.trim() : defaultSubject;

    const sanitizedMessage = String(message)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 24px 28px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em;">${headerTitle}</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">${headerSubtitle}</p>
    </div>
    
    <div style="padding: 24px 28px;">
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Candidate Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${name.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Candidate Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${email.trim()}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${email.trim()}</a></td>
          </tr>
          ${interviewRole ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Target Role:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${interviewRole}</td>
          </tr>` : ""}
          ${examTopic ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${interviewRole ? "Tech Stack / Topic:" : "Exam Topic:"}</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${examTopic}</td>
          </tr>` : ""}
          ${score ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Score & Accuracy:</td>
            <td style="padding: 6px 0; color: #0f172a;">${score} ${accuracy ? `(${accuracy})` : ""}</td>
          </tr>` : ""}
          ${examId ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Session ID:</td>
            <td style="padding: 6px 0; color: #64748b; font-family: monospace;">${examId}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Subject:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${emailSubject}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          Feedback Message
        </h3>
        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;">
${sanitizedMessage}
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        Sent via <strong>PreepX Feedback & Support System</strong>.<br/>
        You can reply directly to this email to respond to <strong>${name.trim()}</strong>.
      </div>
    </div>
  </div>
</body>
</html>
`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      reply_to: email.trim(),
      subject: emailSubject,
      html: htmlContent,
    });

    if (error) {
      console.error("[FEEDBACK] Resend API Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send email.",
      });
    }

    console.log(`[FEEDBACK] Email sent successfully! Message ID: ${data?.id}`);
    return res.status(200).json({
      success: true,
      message: source === "chatbot_support"
        ? "Your query has been sent to our team at contact@preepx.in. We will get back to you shortly!"
        : "Feedback submitted successfully! Thank you for helping us improve PreepX.",
      id: data?.id,
    });
  } catch (err) {
    console.error("[FEEDBACK] Unexpected error sending feedback:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "An unexpected error occurred while sending message.",
    });
  }
};
