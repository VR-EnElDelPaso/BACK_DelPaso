import UserWithoutPassword from "./UserWithoutPassword";

type TypedVerifyCallback = (
    error: Error | null,
    user?: UserWithoutPassword | false,
    info?: { message: string }
) => void;

export default TypedVerifyCallback;