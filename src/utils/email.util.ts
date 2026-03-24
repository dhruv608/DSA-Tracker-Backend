import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email with new design
export const sendOTPEmail = async (email: string, otp: string, userName?: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🚀 DSA Tracker - Secure Password Reset',
      html: `
        <!DOCTYPE html>
        <html style="margin: 0; padding: 0; background-color: #f8fafc;">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DSA Tracker - Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 700;">
                🚀 DSA Tracker
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0;">
                Secure Password Reset
              </p>
            </div>
          </div>

          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Card Container -->
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              
              <!-- Greeting -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; font-size: 24px; margin: 0;">
                  Hi ${userName || 'there'} 👋
                </h2>
              </div>

              <!-- Message -->
              <div style="text-align: center; margin-bottom: 40px;">
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">
                  We received a request to reset your password. 
                  <br />
                  Use the verification code below to continue:
                </p>
              </div>

              <!-- OTP Section -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                  Verification Code
                </p>
                <div style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; line-height: 1; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
                  This code expires in 10 minutes
                </p>
              </div>

              <!-- Warning Section -->
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin-bottom: 30px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>🔒 Security Notice:</strong> Do not share this OTP with anyone. 
                  Our team will never ask for your verification code.
                </p>
              </div>

              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Return to DSA Tracker
                </a>
              </div>

            </div>

            <!-- Help Section -->
            <div style="text-align: center; margin-top: 30px; padding: 20px;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
                Didn't request this password reset?
              </p>
              <div style="background: #f8fafc; border-radius: 8px; padding: 15px; display: inline-block;">
                <p style="color: #475569; font-size: 13px; margin: 0;">
                  Contact our support team at:
                  <br />
                  <a href="mailto:support@dsatracker.com" style="color: #667eea; text-decoration: none; font-weight: 600;">
                    support@dsatracker.com
                  </a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 DSA Tracker. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>

          </div>

        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};