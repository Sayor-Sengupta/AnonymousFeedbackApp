import { resend } from "../lib/resend";

import VerificationEmail from "../../emails/verifcationEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  username: string,
  otp: string,
  email: string
): Promise<ApiResponse> {
  try {

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to:email,
      subject: "Verify your email",
      react: VerificationEmail({ username, otp }),
    });
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email", error);
    return {
      success: false,
      message: "Error sending verification email",
    };
  }
}
