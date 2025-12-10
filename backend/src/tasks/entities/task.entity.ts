import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    isComplete: boolean;

    @Column({ default: 'medium' })
    priority: string; // low, medium, high

    @Column({ default: false })
    isPublic: boolean;

    @Column({ default: false })
    isReminderSent: boolean;

    @Column({ nullable: true })
    attachment: string;

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'timestamp' })
    dueDate: Date;

    @ManyToOne(() => User, (user) => user.tasks)
    user: User;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
