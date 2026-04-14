import { IsArray, IsMongoId, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  users: string[];
}
