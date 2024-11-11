import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await connectToDB();

  try {
    const { username, code } = await request.json();
    const decodeUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodeUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 500 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "verifcation code expired",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "incorrect code",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying User", error);
    return Response.json(
      {
        success: false,
        message: "Error verifyin user",
      },
      { status: 500 }
    );
  }
}
