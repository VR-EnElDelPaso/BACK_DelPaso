import { user } from "@prisma/client";

export default interface UserWithoutPassword extends Omit<user, "password"> { }