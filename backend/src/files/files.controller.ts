import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { join } from 'path';
import { of } from 'rxjs';

@Controller('files')
export class FilesController {
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: any) {
        return {
            filename: file.filename,
            path: file.path,
        };
    }

    @Get(':filename')
    serveFile(@Param('filename') filename, @Res() res) {
        return res.sendFile(join(process.cwd(), 'uploads', filename));
    }
}
