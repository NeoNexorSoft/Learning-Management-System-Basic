export const verifyEmailTemplate = (link: string) => `
  <div>
    Hello,

    <h3>Email Verification</h3>

    Welcome to Neo Nexor! To get started, please verify your email address by clicking the link below:<br/><br/>

    <a href="${link}">
        <button style="padding: 10px 20px; background-color: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer;">Verify Email</button>
    </a>
    <br/><br/>

    If you did not create an account, you can safely ignore this email.
    <br/><br/>

    Best regards, <br/>
    The Neo Nexor Team <br/><br/>
    

    Link: ${link}
  </div>
`;