import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Length(10, 15)
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @Length(10, 15)
  phone: string;

  @IsString()
  @Length(4, 6)
  otp: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class UpsertAddressDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  flatOrHouse: string;

  @IsString()
  areaOrSociety: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsBoolean()
  isSocietyResident?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsOptional()
  @IsBoolean()
  isMobileConfirmed?: boolean;
}

export class MobileConfirmAddressDto {
  @IsString()
  phone: string;

  @IsString()
  flatOrHouse: string;

  @IsString()
  areaOrSociety: string;

  @IsString()
  city: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsBoolean()
  isSocietyResident?: boolean;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
