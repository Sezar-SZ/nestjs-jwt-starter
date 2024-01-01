import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto";
import { CreateUserDto } from "src/users/dto";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { refreshExpireDate } from "src/utils";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UsersService,
        private configService: ConfigService,
        private redisService: RedisService
    ) {}

    async signUp(createUserDto: CreateUserDto, response: Response) {
        try {
            const newUser = await this.userService.create(createUserDto);
            const tokens = await this.getTokens(
                newUser.id,
                newUser.email,
                newUser.role
            );
            await this.userService.addRefreshToken(
                newUser.id,
                tokens.refreshToken
            );
            response.cookie("refresh", tokens.refreshToken, {
                httpOnly: true,
                signed: true,
                secure: this.configService.get("NODE_ENV") === "production",
                expires: refreshExpireDate(),
            });
            return { accessToken: tokens.accessToken };
        } catch (error) {
            if (error.response) throw new UnauthorizedException(error.response);
            throw new InternalServerErrorException(error);
        }
    }

    async login(loginDto: LoginDto, response: Response): Promise<any> {
        const user = await this.userService.findOne(loginDto.email);
        if (!user) throw new UnauthorizedException();
        const match = await bcrypt.compare(loginDto.password, user.password);
        if (match) {
            const tokens = await this.getTokens(user.id, user.email, user.role);
            await this.userService.addRefreshToken(
                user.id,
                tokens.refreshToken
            );
            response.cookie("refresh", tokens.refreshToken, {
                httpOnly: true,
                signed: true,
                secure: this.configService.get("NODE_ENV") === "production",
                expires: refreshExpireDate(),
            });
            return { accessToken: tokens.accessToken };
        }
        throw new UnauthorizedException();
    }

    async logout(request, response: Response) {
        if (request.signedCookies["refresh"]) {
            const sub = await this.decodeIdFromRefresh(
                request.signedCookies["refresh"]
            );
            await this.userService.removeRefreshToken(
                sub,
                request.signedCookies["refresh"]
            );
        }
        response.clearCookie("refresh");
        return { message: "logout successfully" };
    }

    async refresh(req) {
        const refreshToken = req.signedCookies["refresh"];
        const userId = await this.decodeIdFromRefresh(refreshToken);
        const user = await this.userService.findById(userId);
        const refreshTokenMatches = await this.redisService.get(
            `user${userId}:${refreshToken}`
        );

        if (!user || !refreshToken || !refreshTokenMatches)
            throw new ForbiddenException("Access Denied");
        const tokens = await this.getTokens(user.id, user.email, user.role);
        return { accessToken: tokens.accessToken };
    }

    async getTokens(userId: number, email: string, role: Role) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    role,
                },
                {
                    secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
                    expiresIn: this.configService.get("ACCESS_EXPIRATION"),
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    role,
                },
                {
                    secret: this.configService.get<string>(
                        "JWT_REFRESH_SECRET"
                    ),
                    expiresIn: this.configService.get("REFRESH_EXPIRATION"),
                }
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async decodeIdFromRefresh(refreshToken: string) {
        if (refreshToken) return await this.jwtService.decode(refreshToken).sub;
        throw new UnauthorizedException();
    }

    async getCurrentUser(email: string) {
        const user = await this.userService.findOne(email);
        const { password, ...result } = user;
        return result;
    }
}
