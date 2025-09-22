// This is a placeholder for email sending functionality
// In a production environment, you would use a service like SendGrid, Mailgun, etc.

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text version of email
 * @param {String} options.html - HTML version of email
 */
const sendEmail = async (options) => {
  // For development, log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('---------- EMAIL START ----------');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text}`);
    console.log(`HTML: ${options.html}`);
    console.log('---------- EMAIL END ----------');
  }
  
  // In production, integrate with an email service
  if (process.env.NODE_ENV === 'production') {
    // Example integration with SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.FROM_EMAIL,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html
    // });
    
    // For now, just log that we would send an email
    console.log(`[PRODUCTION] Would send email to ${options.to}`);
  }
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} resetToken - Password reset token
 * @param {String} resetUrl - Password reset URL
 */
exports.sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Password Reset Token';
  const text = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following token to reset your password: ${resetToken}\n\nOr click this link: ${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
  const html = `
    <h1>Password Reset</h1>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Please use the following token to reset your password:</p>
    <p><strong>${resetToken}</strong></p>
    <p>Or click this link: <a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;
  
  await sendEmail({ to: email, subject, text, html });
};

/**
 * Send welcome email
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} role - User role
 */
exports.sendWelcomeEmail = async (email, name, role) => {
  const subject = 'Welcome to OnchainERP!';
  const text = `Dear ${name},\n\nWelcome to OnchainERP! Your account has been created with the role of ${role}.\n\nPlease log in to access your dashboard and get started.\n\nBest regards,\nThe OnchainERP Team`;
  const html = `
    <h1>Welcome to OnchainERP!</h1>
    <p>Dear ${name},</p>
    <p>Welcome to OnchainERP! Your account has been created with the role of <strong>${role}</strong>.</p>
    <p>Please log in to access your dashboard and get started.</p>
    <p>Best regards,<br>The OnchainERP Team</p>
  `;
  
  await sendEmail({ to: email, subject, text, html });
};

/**
 * Send assignment submission confirmation
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} assignmentTitle - Assignment title
 * @param {String} courseName - Course name
 */
exports.sendAssignmentSubmissionEmail = async (email, name, assignmentTitle, courseName) => {
  const subject = 'Assignment Submission Confirmation';
  const text = `Dear ${name},\n\nYour assignment "${assignmentTitle}" for the course "${courseName}" has been successfully submitted.\n\nBest regards,\nThe OnchainERP Team`;
  const html = `
    <h1>Assignment Submission Confirmation</h1>
    <p>Dear ${name},</p>
    <p>Your assignment <strong>"${assignmentTitle}"</strong> for the course <strong>"${courseName}"</strong> has been successfully submitted.</p>
    <p>Best regards,<br>The OnchainERP Team</p>
  `;
  
  await sendEmail({ to: email, subject, text, html });
};

/**
 * Send grade notification
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} assignmentTitle - Assignment title
 * @param {String} courseName - Course name
 * @param {Number} grade - Grade received
 */
exports.sendGradeNotificationEmail = async (email, name, assignmentTitle, courseName, grade) => {
  const subject = 'New Grade Posted';
  const text = `Dear ${name},\n\nA new grade has been posted for your assignment "${assignmentTitle}" in the course "${courseName}". You received a grade of ${grade}.\n\nBest regards,\nThe OnchainERP Team`;
  const html = `
    <h1>New Grade Posted</h1>
    <p>Dear ${name},</p>
    <p>A new grade has been posted for your assignment <strong>"${assignmentTitle}"</strong> in the course <strong>"${courseName}"</strong>.</p>
    <p>You received a grade of <strong>${grade}</strong>.</p>
    <p>Best regards,<br>The OnchainERP Team</p>
  `;
  
  await sendEmail({ to: email, subject, text, html });
};
