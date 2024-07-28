import { z } from "zod";
import { createZodDto } from "@wahyubucil/nestjs-zod-openapi";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// export type LoginDto = z.infer<typeof loginSchema>;

export class LoginDto extends createZodDto(loginSchema) {}
export class RegisterDto extends createZodDto(loginSchema) {}
