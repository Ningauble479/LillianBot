import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { PrismaService } from './prisma/prisma.service';
import { PointsService } from './points/points.service';
@Module({
  imports: [DiscordModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, PointsService],
  exports: [PrismaService],
})
export class AppModule {}
