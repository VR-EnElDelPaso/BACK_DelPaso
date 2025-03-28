import { User } from "@prisma/client";

export default interface UserWithoutPassword extends Omit<User, "password"> { }
