import UserModel from "@/models/User";
import { usernameValidation } from '@/schemas/signUpSchema';
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
const UsernameQuerySchema = z.object({ username: usernameValidation });

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get("username")
        }

        const result = UsernameQuerySchema.safeParse(queryParams);
        console.log(result);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return NextResponse.json({ success: false, message: usernameErrors?.length > 0 ? usernameErrors.join(',') : "Invalid query Parameters" }, { status: 400 });
        }

        const { username } = result.data;

        const existingUserNameVerified = await UserModel.findOne({ username, isVerified: true });

        if (existingUserNameVerified) {
            return NextResponse.json({ success: false, message: "Username already Taken" }, { status: 500 });
        };

        return NextResponse.json({ success: true, message: "Username Available" }, { status: 201 });
    } catch (error) {
        console.log("Error in checking username", error);
        return NextResponse.json({ success: false, message: "Error Checking Username" }, { status: 500 });
    }
}