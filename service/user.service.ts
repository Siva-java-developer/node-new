import { Service } from "typedi";
import { UserRepository } from "../dao/user.repository";
import User from "../model/user.model";
import UserResponseDTO from "../dto/user.dto";
import CustomError from "../config/custom.error";

@Service()
class UserService implements UserRepository {
    async getUsers(): Promise<UserResponseDTO[]> {
        const users = await User.find();
        const usersDTO = users.map((user) => UserResponseDTO.toResponse(user));
        return usersDTO;
    }

    async getUserById(id: string): Promise<UserResponseDTO> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        return UserResponseDTO.toResponse(user);
    }

    async createUser(user: any): Promise<void> {
        try {
            await User.create(user);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new CustomError("Username already exists", 400);
            }
            throw error;
        }
    }

    async updateUser(id: string, userData: any): Promise<void> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        
        try {
            await User.findByIdAndUpdate(id, userData, { new: true });
        } catch (error: any) {
            if (error.code === 11000) {
                throw new CustomError("Username already exists", 400);
            }
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        
        await User.findByIdAndDelete(id);
    }
}

export default UserService