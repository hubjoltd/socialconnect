import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email not sent - SENDGRID_API_KEY not configured");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendMeetingInvite(
  meetingTitle: string,
  meetingTime: string,
  meetingLink: string,
  hostName: string,
  hostEmail: string,
  participantEmail: string,
  participantName?: string
): Promise<boolean> {
  const subject = `Meeting Invitation: ${meetingTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">You're invited to join a meeting</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e293b;">${meetingTitle}</h3>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${meetingTime}</p>
        <p style="margin: 5px 0;"><strong>Host:</strong> ${hostName}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meetingLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Join Meeting
        </a>
      </div>
      
      <div style="background-color: #fefce8; padding: 15px; border-radius: 6px; border-left: 4px solid #eab308;">
        <p style="margin: 0; font-size: 14px; color: #713f12;">
          <strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a>
        </p>
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        This invitation was sent by ${hostEmail}. If you have questions about this meeting, 
        please contact the host directly.
      </p>
    </div>
  `;

  const text = `
You're invited to join a meeting

${meetingTitle}
Time: ${meetingTime}
Host: ${hostName}

Join the meeting: ${meetingLink}

If you have questions about this meeting, please contact ${hostEmail}.
  `;

  return await sendEmail({
    to: participantEmail,
    from: hostEmail,
    subject,
    html,
    text
  });
}

export async function sendContactInvite(
  inviterName: string,
  inviterEmail: string,
  contactEmail: string,
  inviteMessage?: string
): Promise<boolean> {
  const subject = `${inviterName} wants to connect with you`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Contact Invitation</h2>
      
      <p><strong>${inviterName}</strong> (${inviterEmail}) would like to add you to their contacts.</p>
      
      ${inviteMessage ? `
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">"${inviteMessage}"</p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" 
           style="background-color: #16a34a; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
          Accept
        </a>
        <a href="#" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
          Decline
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: contactEmail,
    from: inviterEmail,
    subject,
    html
  });
}