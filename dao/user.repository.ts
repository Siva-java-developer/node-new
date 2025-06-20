import UserResponseDTO from "../dto/user.dto";

export interface UserRepository {
    createUser(user: any): Promise<void>;
    getUsers(): Promise<UserResponseDTO[]>;
    getUserById(id: string): Promise<UserResponseDTO>;
    updateUser(id: string, userData: any): Promise<void>;
    deleteUser(id: string): Promise<void>;
}