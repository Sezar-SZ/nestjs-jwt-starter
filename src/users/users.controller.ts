import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ZodValidationPipe } from "src/validators/zod.validator";
import { CreateUserDto, createUserSchema } from "./dto";

@Controller("users")
export class UsersController {
    constructor(private userService: UsersService) {}

    // @Post("signup")
    // @UsePipes(new ZodValidationPipe(createUserSchema))
    // signup(@Body() createUserDto: CreateUserDto) {
    //     return this.userService.create(createUserDto);
    // }
}
