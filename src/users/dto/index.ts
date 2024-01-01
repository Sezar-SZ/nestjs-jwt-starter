import { UserModel } from "prisma/zod";
import { z } from "zod";

export const createUserSchema = UserModel.omit({ id: true, role: true });
export type CreateUserDto = z.infer<typeof createUserSchema>;
