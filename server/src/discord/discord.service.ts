import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import * as dotenv from 'dotenv';
import { onMessageDelete } from './events/onMessageDelete';
import { onMessageCreate } from './events/onMessageCreate';
import { onInteractionCreate } from './events/onInteractionCreate';
import { PointsService } from 'src/points/points.service';
dotenv.config();

@Injectable()
export class DiscordService implements OnModuleInit {
  constructor(private readonly pointsService: PointsService) {}
  private client: Client;

  async onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages, // (Optional, just for safety)
        ],
    });

    this.client.once(Events.ClientReady, () => {
      console.log(`🤖 Logged in as ${this.client.user?.tag}`);
    });

    //Checks messages for a lot of things. Currently only checks for misgendered pronouns.
    onMessageCreate(this.client, this.pointsService);
    //When a message is deleted, it logs it to the deleted-message-log channel.
    onMessageDelete(this.client);
    //Handles slash commands
    onInteractionCreate(this.client, this.pointsService);

    await this.client.login(process.env.DISCORD_TOKEN);
  }
}