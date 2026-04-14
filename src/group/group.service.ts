import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { Group } from '../group/schemas/group.schema';
import { CreateGroupDto } from '../group/dto/create-group.dto';
import { Injectable } from '@nestjs/common';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  async createGroup(dto: CreateGroupDto) {
    return this.groupModel.create(dto);
  }

  async findOneGroup(filter: QueryFilter<Group>) {
    return this.groupModel.findOne(filter);
  }

  async findAllGroup() {
    return this.groupModel.find();
  }

  async updateGroup(id: string, update: UpdateQuery<Group>) {
    return this.groupModel.findByIdAndUpdate(id, update);
  }
}
