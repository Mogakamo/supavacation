import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import path from "path";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  // secure: false,
});

const emailsDir = path.resolve(process.cwd(), "emails");

const sendVerificationRequest = ({ identifier, url }) => {
  const emailFile = readFileSync(path.join(emailsDir, "confirm-email.html"), {
    encoding: "utf8",
  });

  const emailTemplate = Handlebars.compile(emailFile);

  transporter.sendMail({
    from: `"✨ Supavacation" ${process.env.EMAIL_FROM}`,
    to: identifier,
    subject: "Your sign-in link for Supavacation",
    html: emailTemplate({
      base_url: process.env.NEXTAUTH_URL,
      signin_url: url,
      email: identifier,
    }),
  });
};

const sendWelcomeEmail = async ({ user }) => {
  const { email } = user;

  try {
    const emailFile = readFileSync(path.join(emailsDir, "welcome.html"), {
      encoding: "utf8",
    });
    const emailTemplate = Handlebars.compile(emailFile);
    await transporter.sendMail({
      from: `"✨ Supavacation" ${process.env.EMAIL_FROM}`,
      to: email,
      subject: "Welcome to Supavacation 🎉",
      html: emailTemplate({
        base_url: process.env.NEXTAUTH_URL,
        support_email: "mogaka.amo254@gmail.com",
      }),
    });
  } catch (err) {
    console.log(`❌ Unable to send welcome email to user (${email})`);
  }
};

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    EmailProvider({
      maxAge: 10 * 60,
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    verifyRequest: "/",
  },
  adapter: PrismaAdapter(prisma),
  events: { createUser: sendWelcomeEmail },
});
