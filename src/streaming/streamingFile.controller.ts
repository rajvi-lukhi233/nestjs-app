import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('file')
export class ReadPdfController {
  @Get(':fileName')
  getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'uploads', fileName));
    file.on('data', (chunk) => {
      res.write(chunk);
    });
    file.on('end', () => {
      res.end();
    });
    // file.pipe(res);
  }
}
