import {
  IUserPublic,
  PaginatedResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSearchParams,
} from '@app/shared-types';
import { IUserDataSource } from '../interfaces/IUserDataSource';

export interface UserServiceOptions {
  dataSource: IUserDataSource;
}

export class UserService {
  private dataSource: IUserDataSource;

  constructor(options: UserServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getMyProfile(): Promise<IUserPublic> {
    return await this.dataSource.getMyProfile();
  }

  async updateMyProfile(data: UpdateProfileRequest): Promise<IUserPublic> {
    return await this.dataSource.updateMyProfile(data);
  }

  async uploadProfilePhoto(file: File): Promise<{ url: string }> {
    return await this.dataSource.uploadProfilePhoto(file);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return await this.dataSource.changePassword(data);
  }

  async getUserById(userId: string): Promise<IUserPublic> {
    return await this.dataSource.getUserById(userId);
  }

  async listUsers(params?: UserSearchParams): Promise<PaginatedResponse<IUserPublic>> {
    return await this.dataSource.listUsers(params);
  }

  async updateUser(userId: string, data: Partial<IUserPublic>): Promise<IUserPublic> {
    return await this.dataSource.updateUser(userId, data);
  }

  async deleteUser(userId: string): Promise<void> {
    return await this.dataSource.deleteUser(userId);
  }
}