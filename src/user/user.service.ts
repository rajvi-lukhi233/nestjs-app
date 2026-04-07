import { ConflictException, Injectable } from '@nestjs/common';
import { registerDto } from 'src/auth/dto/register.dto';
import { User } from './schemas/user.schema';
import { Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(registerUserDto: registerDto) {
    try {
      return await this.userModel.create(registerUserDto);
    } catch (error) {
      const duplicate_key_code = 11000;
      if (error.code == duplicate_key_code) {
        throw new ConflictException('Email is already taken');
      }
      throw error;
    }
  }

  async findUser(filter: QueryFilter<User>) {
    return await this.userModel.findOne(filter);
  }

  async updateUserById(id: string, data: UpdateQuery<User>) {
    return await this.userModel.findByIdAndUpdate(id, data);
  }
}
