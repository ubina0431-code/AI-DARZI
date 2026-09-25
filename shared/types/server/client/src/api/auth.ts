import type { IUser } from '@shared/types';
import api from '../api/axios';

export interface AuthUser extends Pick<IUser, 'email' | 'firstName' | 'lastName' | 'role'> {
  _id: string;
  avatar?: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const login = async (credentials: { email: IUser['email']; password: string }) => {
  const { data } = await api.post('/auth/login', credentials);
  return {
    token: data.data.token,
    user: {
      ...data.data.user,
      _id: String(data.data.user.id),
    },
  } satisfies LoginResult;
};

export const register = async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'isActive' | 'isEmailVerified'>) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};
