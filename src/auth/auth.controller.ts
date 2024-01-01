import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,
    UseGuards,
    Get,
    Delete,
    Res,
    Req,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "src/validators/zod.validator";
import { LoginDto, loginSchema } from "./dto";
import { Role } from "@prisma/client";
import { Roles } from "./decorators/roles.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { CreateUserDto, createUserSchema } from "src/users/dto";
import { AccessTokenGuard } from "./guards/accessToken.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    @UsePipes(new ZodValidationPipe(loginSchema))
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return await this.authService.login(loginDto, response);
    }

    @Post("signup")
    @UsePipes(new ZodValidationPipe(createUserSchema))
    signup(
        @Body() createUserDto: CreateUserDto,
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
    @Get()
    async getProfile(@Req() req) {
        console.log(req.user);
        return await this.authService.getCurrentUser(req.user.email);
    }

    @Roles(Role.ADMIN)
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Delete()
    delete() {
        return { message: "protected route, only for user with admin role!" };
    }
}
