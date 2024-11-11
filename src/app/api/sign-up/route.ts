import connectToDB from "@/lib/dbConnect";

import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await connectToDB();

  try {
    const { username, email, password } = await request.json();

    const existingUserVeriyByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVeriyByUserName) {
      return Response.json(
        {
          success: false,
          menubar: "Username is already taken",
        },
        { status: 400 }
      );
    }
    const existingUserVeriyByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserVeriyByEmail) {
      if (existingUserVeriyByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            menubar: "Email is already taken",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVeriyByEmail.password = hashedPassword;
        existingUserVeriyByEmail.verifyCode = verifyCode;
        existingUserVeriyByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingUserVeriyByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const exipiryDate = new Date();
      exipiryDate.setHours(exipiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: exipiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
    }
    const emailResponse = await sendVerificationEmail(
      username,
      verifyCode,
      email
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          menubar: emailResponse.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        menubar: "Sign up successful.please verify",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error while signing up", error);
    return Response.json(
      {
        success: false,
        message: "Error while signing up",
      },
      { status: 500 }
    );
  }
}
