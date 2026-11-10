import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StorefrontMode } from '@prisma/client';

export class GetPublicProductsQueryDto {
  @IsOptional()
  @IsEnum(StorefrontMode)
  mode?: StorefrontMode;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  featuredOnly?: string;
}
