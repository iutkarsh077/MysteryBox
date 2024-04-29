import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";
import { NextResponse } from "next/server";
import { date } from "zod";

export async function POST(request: Request){
    await dbConnect();

    const {username, content} = await request.json();

    try {
        const user = await UserModel.findOne({username});

        if(!user){
            return NextResponse.json({ success: false, message: "user Not found" }, { status: 404 });
        }

        if(!user.isAcceptingMessage){
            return NextResponse.json({ success: false, message: "User not accepting Messages" }, { status: 403 });
        }

        const newMessage = {content, createdAt: new Date()};

        user.messages.push(newMessage as Message);
        await user.save();

        return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "failed to Send Messages" }, { status: 500 });
    }
}