import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
    Get,
    Delete,
    Res,
    Req,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";
import { Role } from "@prisma/client";
import { Roles } from "./decorators/roles.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { AccessTokenGuard } from "./guards/accessToken.guard";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return await this.authService.login(loginDto, response);
    }

    @Post("signup")
    signup(
        @Body() createUserDto: RegisterDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.signUp(createUserDto, response);
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.logout(request, response);
    }

    @Get("refresh")
    async refreshTokens(@Req() req) {
        return await this.authService.refresh(req);
    }

    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @Get()
    async getProfile(@Req() req) {
        console.log(req.user);
        return await this.authService.getCurrentUser(req.user.email);
    }

    @Roles(Role.ADMIN)
    @UseGuards(AccessTokenGuard, RolesGuard)
    @ApiBearerAuth()
    @Delete()
    delete() {
        return { message: "protected route, only for user with admin role!" };
    }
}
