import mongoose, { Schema, Document } from 'mongoose';


export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
})


export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: string;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}


const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please enter a valid email"],
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
    },

    verifyCode: {
        type: String,
        required: [true, "Verification code is required"],
    },

    verifyCodeExpiry: {
        type: String,
        required: [true, "Verification code expiry is required"],
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isAcceptingMessage: {
        type: Boolean,
        default: true
    },

    messages: [MessageSchema]
})

const UserModel = (mongoose.models.mystryboxUser as mongoose.Model<User>) || (mongoose.model<User>("mystryboxUser", UserSchema));

export default UserModel;