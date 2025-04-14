import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { PointsService } from 'src/points/points.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    DiscordService, 
    PointsService,
    PrismaService,
  ],
})
export class DiscordModule {}