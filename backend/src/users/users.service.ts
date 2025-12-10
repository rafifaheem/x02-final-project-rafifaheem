import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: any) {
        const user = this.usersRepository.create(createUserDto);
        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Email already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    findAll() {
        return this.usersRepository.find();
    }

    findOne(id: number) {
        return this.usersRepository.findOneBy({ id });
    }

    findOneByEmail(email: string) {
        return this.usersRepository.findOneBy({ email });
    }

    update(id: number, updateUserDto: any) {
        return this.usersRepository.update(id, updateUserDto);
    }

    remove(id: number) {
        return this.usersRepository.delete(id);
    }
}
