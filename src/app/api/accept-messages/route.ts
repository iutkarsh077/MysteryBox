import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            isAcceptingMessage: acceptMessages
        }, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "Failed to update user status to accept messages" }, { status: 401 });
        }

        return NextResponse.json({ success: true, message: "Message acceptance status successfully", updatedUser }, { status: 201 });
    } catch (error) {
        console.log("Failed to update user status to accespt messages", error);
        return NextResponse.json({ success: false, message: "Failed to update user status to accespt messages" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return NextResponse.json({ success: false, message: "Failed to find User" }, { status: 404 });
        }

        return NextResponse.json({
            success: true, message: "User found", isAcceptingMessage: foundUser.isAcceptingMessage
        }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false, message: "Error in getting message acceptance"
        }, { status: 500 });
    }
}