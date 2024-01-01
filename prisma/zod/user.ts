import * as z from "zod";
import { Role } from "@prisma/client";

export const UserModel = z.object({
    id: z.number().int(),
    email: z.string().email(),
    password: z.string(),
    role: z.nativeEnum(Role),
});
