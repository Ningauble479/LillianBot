import { Message } from "discord.js";

const PRONOUN_ROLES = ['he/him', 'she/her', 'they/them', 'dumb/bo']; // Add more if needed

export async function getMentionedUserPronouns(message: Message): Promise<string | null> {
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser || !message.guild) return null;
  
    const member = await message.guild.members.fetch(mentionedUser.id);
    if (!member) return null;
  
    const pronounRole = PRONOUN_ROLES.find(role =>
      member.roles.cache.some(r => r.name.toLowerCase() === role)
    );
  
    return pronounRole || null;
}