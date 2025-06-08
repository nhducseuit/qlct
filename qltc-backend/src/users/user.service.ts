import { Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User, inMemoryDb } from '@models/index'; // Adjusted path
import { CreateUserDto } from '../auth/dto/create-user.dto'; // Adjusted path

@Injectable()
export class UserService {
  private readonly users: User[] = inMemoryDb.users;

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser: User = {
      id: uuidv4(),
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email.toLowerCase());
  }
}