import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { username, password } = createAuthDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const auth = this.authRepository.create({
      username,
      password: hashedPassword,
    });
    try {
      await this.authRepository.save(auth);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(createAuthDto: CreateAuthDto): Promise<{ accessToken: string }> {
    const { username, password } = createAuthDto;
    const auth = await this.authRepository.findOne({ where: { username } });
    if (!auth) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isValid = await bcrypt.compare(password, auth.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const payload: JwtPayload = { username };
    const accessToken: string = await this.jwtService.sign(payload);
    return { accessToken };
  }

  findAll() {
    return this.authRepository.find({});
  }

  findOne(id: string) {
    return `This action returns a #${id} auth`;
  }

  update(id: string, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }
}
