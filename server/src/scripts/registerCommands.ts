import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName('points')
        .setDescription('Replies with your current points!'),
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily point reward'),
    new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Try to steal points from another user')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('Who you want to rob')
            .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin to try and double your points')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('How many points to gamble')
            .setMinValue(1)
            .setRequired(true)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Registering slash command...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands },
    );

    console.log('Slash command registered!');
  } catch (error) {
    console.error(error);
  }
})();