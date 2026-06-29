const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "poonia22704@gmail.com",
        pass: "jyfz ohre nlzv pegw",
      },
    });

    const mailOption = {
      from: "poonia22704@gmail.com",
      to: to,
      subject: subject,
      text: text,
      html: `<h2>${subject}</h2><p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOption);
    console.log("Message sent successfully");
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};

module.exports = sendMail;
