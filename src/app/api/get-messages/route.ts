import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import mongoose, { mongo } from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!user || user.length === 0) {
            return NextResponse.json({ success: false, message: "user not found" }, { status: 401 });
        }

        return NextResponse.json({ success: true, message: user[0].messages }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "failed to get messages" }, { status: 500 });
    }
}