import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { log } from "console";

export async function POST(request: Request) {
  await connectToDB();

  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 }
      );
    }

    if (user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "user is not accepting messages",
        },
        { status: 403 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    log("error sending message", error);
    return Response.json(
      {
        success: false,
        message: "error sending message",
      },
      { status: 500 }
    );
  }
}
