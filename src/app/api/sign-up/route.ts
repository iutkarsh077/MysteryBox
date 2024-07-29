"use server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";
import { use } from "react";
import Sendit from "@/lib/SendIt";
import { revalidatePath } from "next/cache";
export async function POST(request: Request) {
    dbConnect();
    revalidatePath("/sign-up");
    try {
        const { username, email, password } = await request.json();

        const findVerifiedUserByUserName = await UserModel.findOne({ username, isVerified: true });

        if (findVerifiedUserByUserName) {
            return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 400 });
        }

        const findExistingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (findExistingUserByEmail) {
            //Todo something
            if (findExistingUserByEmail.isVerified) {
                return NextResponse.json({ success: false, message: "Email is already registered" }, { status: 400 });
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);

                findExistingUserByEmail.password = hashedPassword;
                findExistingUserByEmail.verifyCode = verifyCode;
                findExistingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000).toString();

                await findExistingUserByEmail.save();
            }
        }

        else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            })

            await newUser.save();
        }

        //send verification email
        console.log("In api/signup", email, username, verifyCode)
        const emailResponse = await Sendit({to: email, name: username, subject: "Verification Email", body: verifyCode});
       

        return NextResponse.json({ success: true, message: "User Registered successfully, plz verify your email!" }, { status: 201 });

    } catch (error) {
        console.error('Error registering user:', error);
        return Response.json(
            {
                success: false,
                message: 'Error registering user',
            },
            { status: 500 }
        );
    }
}