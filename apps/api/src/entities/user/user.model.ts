import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: 'user' | 'editor' | 'admin';
  profileImage?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    type:      { type: String, enum: ['user','editor','admin'], default: 'user' },
    profileImage: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);