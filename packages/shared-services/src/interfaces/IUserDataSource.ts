import {
  IUserPublic,
  PaginatedResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSearchParams,
} from '@app/shared-types';

export interface IUserDataSource {
  getMyProfile(): Promise<IUserPublic>;
  updateMyProfile(data: UpdateProfileRequest): Promise<IUserPublic>;
  uploadProfilePhoto(file: File): Promise<{ url: string }>;
  changePassword(data: ChangePasswordRequest): Promise<void>;
  getUserById(userId: string): Promise<IUserPublic>;
  listUsers(params?: UserSearchParams): Promise<PaginatedResponse<IUserPublic>>;
  updateUser(userId: string, data: Partial<IUserPublic>): Promise<IUserPublic>;
  deleteUser(userId: string): Promise<void>;
}