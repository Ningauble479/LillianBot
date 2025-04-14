import {
    Events,
    Message,
    Client
} from 'discord.js';
import { getMentionedUserPronouns } from '../utils/getMentionedUserPronouns';
import { checkMisgender } from '../utils/checkMisgender';
import { PointsService } from 'src/points/points.service';
//Checks for misgendered pronouns

export async function onMessageCreate(client: Client, pointsService: PointsService) {
    client.on(Events.MessageCreate, async (message: Message) => {

        const userId = message.author.id;
        const newBalance = await pointsService.addPoint(userId);

        console.log(`${message.author.username} has ${newBalance} points`);

        //If the message is from a bot, Ignore it
        if (message.author.bot) return;

        //If the message doesn't mention a user, Ignore it
        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) return;

        const pronouns = await getMentionedUserPronouns(message);

        if (pronouns) {
            const usedWrongPronouns = checkMisgender(message.content, pronouns);
            if (usedWrongPronouns) {
                await message.reply(`You misgendered ${mentionedUser.username}! You have been given a strike! Another strike and you will owe us your cars pink slip! Be careful!`);
            }
        }
    });
}