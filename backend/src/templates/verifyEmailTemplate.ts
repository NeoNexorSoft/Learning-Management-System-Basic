export const verifyEmailTemplate = (link: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#111827;">
                Neo Nexor
              </h2>
              <p style="margin:5px 0 0; color:#6b7280; font-size:14px;">
                Secure Learning Platform
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center">
              <h3 style="margin:0; color:#111827; font-size:22px;">
                Verify Your Email Address
              </h3>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:20px; color:#374151; font-size:16px; line-height:1.6;">
              Welcome to <strong>Neo Nexor</strong>!  
              <br/><br/>
              To complete your registration and start using your account, please verify your email address by clicking the button below.
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <a href="${link}" 
                 style="
                   background-color:#2563eb;
                   color:#ffffff;
                   padding:14px 28px;
                   text-decoration:none;
                   border-radius:6px;
                   font-size:16px;
                   font-weight:bold;
                   display:inline-block;
                 ">
                Verify Email
              </a>
            </td>
          </tr>

          <!-- Backup Link -->
          <tr>
            <td style="font-size:14px; color:#6b7280; line-height:1.5;">
              If the button above does not work, copy and paste the following link into your browser:
              <br/><br/>
              <a href="${link}" style="color:#2563eb; word-break:break-all;">
                ${link}
              </a>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding-top:25px; font-size:14px; color:#6b7280;">
              If you did not create an account, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;">
              <hr style="border:none; border-top:1px solid #e5e7eb; margin-bottom:20px;">
              
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Best regards,<br/>
                <strong>Neo Nexor Team</strong>
              </p>

              <p style="margin-top:15px; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Neo Nexor. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;