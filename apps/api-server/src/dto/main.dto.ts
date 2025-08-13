import { IsMongoId, IsOptional, IsString } from 'class-validator'

export class GetByMongoIdDto {
  @IsMongoId()
  id!: string
}

export class UpdateBasicImageDto {
  /** 關聯至 StorageFile */
  @IsMongoId()
  @IsOptional()
  file?: string

  @IsString()
  @IsOptional()
  alt?: string
}
