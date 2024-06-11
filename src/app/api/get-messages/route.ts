import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const userId = _user._id;
  // console.log(userId)
  try {
    const user = await UserModel.findOne({
      _id: userId
    });
    // console.log("In fetchMessages backend");
    // console.log(user)
    if (!user) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }


    return Response.json(
      { messages: user.messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}