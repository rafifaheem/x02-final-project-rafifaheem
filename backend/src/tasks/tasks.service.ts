import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    create(createTaskDto: CreateTaskDto, userId: number) {
        const task = this.tasksRepository.create({ ...createTaskDto, userId });
        return this.tasksRepository.save(task);
    }

    findAll(userId: number, filters?: any) {
        // Basic implementation, filters can be added here
        const query = this.tasksRepository.createQueryBuilder('task')
            .where('task.userId = :userId', { userId });

        if (filters?.search) {
            query.andWhere('task.title LIKE :search', { search: `%${filters.search}%` });
        }
        if (filters?.priority) {
            query.andWhere('task.priority = :priority', { priority: filters.priority });
        }
        if (filters?.category) {
            query.andWhere('task.category = :category', { category: filters.category });
        }

        if (filters?.status) {
            if (filters.status === 'late') {
                query.andWhere('task.isComplete = :isComplete', { isComplete: false });
                query.andWhere('task.dueDate < :now', { now: new Date() });
            } else if (filters.status === 'pending') {
                query.andWhere('task.isComplete = :isComplete', { isComplete: false });
                // Pending means incomplete AND (dueDate >= now OR dueDate is NULL)
                query.andWhere('(task.dueDate >= :now OR task.dueDate IS NULL)', { now: new Date() });
            } else {
                const isComplete = filters.status === 'done';
                query.andWhere('task.isComplete = :isComplete', { isComplete });
            }
        }

        if (filters?.sortBy) {
            const order = filters.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query.orderBy(`task.${filters.sortBy}`, order);
        } else {
            query.orderBy('task.id', 'DESC'); // Default sort
        }

        return query.getMany();
    }

    async findOne(id: number, userId: number) {
        const task = await this.tasksRepository.findOneBy({ id });
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        if (task.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        return task;
    }

    async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
        const task = await this.findOne(id, userId);
        this.tasksRepository.merge(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async remove(id: number, userId: number) {
        const task = await this.findOne(id, userId);
        return this.tasksRepository.remove(task);
    }

    async findAllPublic(userId: number) {
        return this.tasksRepository.find({
            where: {
                userId,
                isPublic: true,
            },
        });
    }

    async findTasksDueSoon(start: Date, end: Date) {
        return this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.user', 'user')
            .where('task.dueDate BETWEEN :start AND :end', { start, end })
            .andWhere('task.isComplete = :isComplete', { isComplete: false })
            .andWhere('task.isReminderSent = :isReminderSent', { isReminderSent: false })
            .getMany();
    }

    async markReminderSent(id: number) {
        return this.tasksRepository.update(id, { isReminderSent: true });
    }
}
