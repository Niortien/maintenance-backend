import {
  Body, Controller, Get, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RegisterResponsableDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from './current-responsable.decorator';

@ApiTags('Auth — Responsables de site')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @ApiOperation({ summary: 'Connexion responsable de site' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/register
  @ApiOperation({ summary: 'Créer un compte responsable (admin)' })
  @Post('register')
  register(@Body() dto: RegisterResponsableDto) {
    return this.authService.register(dto);
  }

  // GET /auth/me
  @ApiOperation({ summary: 'Profil du responsable connecté + détails du site' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentResponsable() user: ResponsableWithSite) {
    return this.authService.getProfile(user.id);
  }

  // GET /auth/me/stats
  @ApiOperation({ summary: 'Statistiques du site du responsable connecté' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getSiteStats(@CurrentResponsable() user: ResponsableWithSite) {
    return this.authService.getSiteStats(user.siteId);
  }

  // PATCH /auth/me/password
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }
}
