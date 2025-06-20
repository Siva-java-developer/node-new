import { IUser, UserRole } from "../model/user.model";

export default class UserDTO {
    id!: string;
    firstName!: string;
    lastName!: string;
    username!: string;
    email!: string;
    age!: number;
    gender!: string;
    mobileNumber!: string;
    role!: UserRole;
    class!: string;
    
    // Mapper function
    static toResponse(user: IUser): UserDTO {
      const userDTO = new UserDTO();
      userDTO.id = user._id;
      userDTO.firstName = user.firstName;
      userDTO.lastName = user.lastName;
      userDTO.username = user.username;
      userDTO.email = user.email;
      userDTO.age = user.age;
      userDTO.gender = user.gender;
      userDTO.mobileNumber = user.mobileNumber;
      userDTO.role = user.role;
      userDTO.class = user.class;
  
      return userDTO;
    }

    static toRequest(user: UserDTO): any {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender,
            mobileNumber: user.mobileNumber,
            role: user.role,
            class: user.class
        };
      }
  }