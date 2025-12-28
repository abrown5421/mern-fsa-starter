export type UserType = 'user' | 'editor' | 'admin';

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: UserType;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type?: UserType;
  profileImage?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  type?: UserType;
  profileImage?: string;
}