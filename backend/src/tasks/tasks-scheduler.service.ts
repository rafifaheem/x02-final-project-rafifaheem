import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';
import { EmailService } from '../email/email.service';
import { Between } from 'typeorm';

@Injectable()
export class TasksSchedulerService {
    private readonly logger = new Logger(TasksSchedulerService.name);

    constructor(
        private readonly tasksService: TasksService,
        private readonly emailService: EmailService,
    ) { }

    // TEST MODE: Run every 30 seconds
    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleDailyReminders() {
        this.logger.debug('Running daily reminders...');

        const now = new Date();
        // Look for tasks due between 24 hours from now and 24 hours + 5 minutes from now
        const startWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
        const endWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000); // +24h 30m (Wide window for testing)

        const tasks = await this.tasksService.findTasksDueSoon(startWindow, endWindow);
        this.logger.debug(`Found ${tasks.length} tasks due in ~24 hours.`);

        for (const task of tasks) {
            if (task.user && task.user.email) {
                const subject = `Reminder: Task "${task.title}" is due in 24 hours!`;
                const content = `Hi, \n\nYour task "${task.title}" is due tomorrow at ${new Date(task.dueDate).toLocaleTimeString()}. \n\nDon't forget!`;

                await this.emailService.sendEmail(task.user.email, subject, content);
                await this.tasksService.markReminderSent(task.id);
            }
        }
    }
}
