export type UserRole = 'customer' | 'tailor' | 'admin';

export interface IUser {
  _id: string; // Using string to be portable between client/server
  email: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
