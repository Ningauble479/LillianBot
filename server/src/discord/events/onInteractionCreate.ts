import {
    Client,
    Events
} from 'discord.js';
import { PointsService } from 'src/points/points.service';

export function onInteractionCreate(client: Client, pointsService: PointsService) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'points') {
            const userId = interaction.user.id;
            const points = await pointsService.getPoints(userId);
      
            await interaction.reply({
              content: `💰 You have **${points}** points!`,
              ephemeral: true, // Only visible to the user
            });
        }

        if (commandName === 'daily') {
            const userId = interaction.user.id;
            const result = await pointsService.claimDaily(userId);
          
            if (result.success) {
              await interaction.reply(`🌟 You claimed your daily reward! You now have **${result.points}** points.`);
            } else {
              const minutesLeft = Math.ceil((result.retryIn || 0) / 60000);
              await interaction.reply({
                content: `⏳ You’ve already claimed your daily today! Try again in **${minutesLeft} minutes**.`,
                ephemeral: true,
              });
            }
        }

        if (commandName === 'steal') {
          const attackerId = interaction.user.id;
          const targetUser = interaction.options.getUser('target');
        
          if (!targetUser || targetUser.bot) {
            return await interaction.reply({
              content: `🚫 You can't steal from bots.`,
              ephemeral: true,
            });
          }
        
          const result = await pointsService.attemptSteal(attackerId, targetUser.id);
        
          await interaction.reply({
            content: `${result.message}\nYou now have **${result.attackerPoints}** points.`,
            ephemeral: false,
          });
        }

        if (commandName === 'coinflip') {
          const userId = interaction.user.id;
          const amount = interaction.options.getInteger('amount', true);
        
          const result = await pointsService.coinflip(userId, amount);
        
          await interaction.reply({
            content: `${result.message}\nYou now have **${result.balance}** points.`,
            ephemeral: false,
          });
        }
            
    });
  }
