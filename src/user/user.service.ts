import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, CreateUserInput } from './user.entity';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
require('dotenv').config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userByEmail(email);
    const { salt, password: storedPassword } = user;
    const encrypted = this.sha512(password, salt);

    if (storedPassword !== encrypted.passwordHash)
      throw new BadRequestException({ message: 'Wrong password' });

    const token = jwt.sign(
      {
        username: user.username,
        id: user.id,
      },
      process.env.JWT_SECRET,
    );
    return token;
  }

  async byId(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  async userByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw new NotFoundException({ message: 'No such user' });
    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { username, email, password, passwordRepeat } = input;
    if (password !== passwordRepeat)
      throw new BadRequestException({ message: 'Password mismatch' });

    const encrypted = this.saltHashPassword(password);
    const { salt, passwordHash } = encrypted;

    const user = await this.userRepository.save({
      username,
      email,
      password: passwordHash,
      salt,
    });

    return user;
  }

  /**
   * generates random string of characters i.e salt
   * @function
   * @param {number} length - Length of the random string.
   */
  genRandomString(length) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * hash password with sha512.
   * @function
   * @param {string} password - List of required fields.
   * @param {string} salt - Data to be validated.
   */
  sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
      salt,
      passwordHash: value,
    };
  }

  saltHashPassword(password) {
    return this.sha512(password, this.genRandomString(16));
  }
}
