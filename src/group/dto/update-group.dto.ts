import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { IsArray, IsBoolean, IsMongoId, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsArray()
  @IsMongoId({ each: true })
  users: string[];

  @IsBoolean()
  isRemove: boolean;
}
