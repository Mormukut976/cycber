const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Welcome to CyberScripts Pro!',
    html: `
      <h2>Welcome to CyberScripts Pro, ${user.name}!</h2>
      <p>Thank you for joining our community of cybersecurity professionals.</p>
      <p>Start exploring our premium scripts and courses to enhance your skills.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPurchaseConfirmation = async (user, product, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Purchase Confirmation - ${product.name}`,
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>You have successfully purchased: <strong>${product.name}</strong></p>
      <p>Amount: $${product.price}</p>
      <p>Order ID: ${order._id}</p>
      <p>You can access your purchase from your dashboard.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
