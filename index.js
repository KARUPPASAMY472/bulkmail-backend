const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection
mongoose
  .connect("mongodb+srv://mksamy:12345@cluster0.hh7j086.mongodb.net/sendgmail?appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(() => console.log("❌ Database connection failed"));

const credential = mongoose.model("credential", {}, "bulkmail");

// ✅ Use /api/sendemail instead of /sendemail
app.post("/api/sendemail", async function (req, res) {
  try {
    const msg = req.body.msg;
    const emailList = req.body.emailList;

    const data = await credential.find();
    if (!data || !data[0]) {
      return res.status(400).json({ message: "No credentials found in DB" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: "mkaruppas477@gmail.com",
        to: emailList[i],
        subject: "A message is me send",
        text: msg,
      });
      console.log("✅ Email sent:", emailList[i]);
    }

    res.send(true);
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    res.send(false);
  }
});

// ❌ REMOVE app.listen(5000)
// ✅ Export the app for Vercel
module.exports = app;
