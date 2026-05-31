import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'responsable.assinie@sate.ci' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Assinie@2026' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterResponsableDto {
  @ApiProperty({ example: 'Konan' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Eric' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'responsable.assinie@sate.ci' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Assinie@2026', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password: string;

  @ApiPropertyOptional({ example: '+22507000001' })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiProperty({ description: 'ID du site géré par ce responsable' })
  @IsString()
  @IsNotEmpty()
  siteId: string;
}

export class UpdateResponsableDto {
  @ApiPropertyOptional({ example: 'Konan' })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional({ example: 'Eric' })
  @IsString()
  @IsOptional()
  prenom?: string;

  @ApiPropertyOptional({ example: '+22507000001' })
  @IsString()
  @IsOptional()
  telephone?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ancienMotDePasse: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  nouveauMotDePasse: string;
}

export class LoginAdminDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
