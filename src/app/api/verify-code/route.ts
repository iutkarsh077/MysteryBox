import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username); //Not Uisng
        console.log(username, code);
        const user = await UserModel.findOne({ username });
        console.log(user);
        if (!user) {
            return NextResponse.json({ success: false, message: "Error verifying User!" }, { status: 500 });
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return NextResponse.json({ success: true, message: "Account Verified successfully" }, { status: 200 });
        } else if (!isCodeNotExpired) {
            return NextResponse.json({ success: false, message: "Verification Code expired, Sign UP Again" }, { status: 400 });
        } else {
            return NextResponse.json({ success: false, message: "Verification Code Invalid" }, { status: 400 });
        }


    } catch (error) {
        console.log("Verification Code Error", error);
        return NextResponse.json({ success: false, message: "Verification Code Invalid" }, { status: 500 });
    }
}