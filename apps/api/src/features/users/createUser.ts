import { UserModel } from '../../entities/user/user.model';
import { hashPassword } from '../../shared/password';

interface CreateUserProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type?: 'user' | 'editor' | 'admin';
  profileImage?: string;
}

export const createUser = async (data: CreateUserProps) => {
  const hashedPassword = await hashPassword(data.password);
  const user = new UserModel({
    ...data,
    password: hashedPassword,
  });
  return user.save();
};
