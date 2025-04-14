import {
    AuditLogEvent,
    Client,
    Events,
    Message,
    PartialMessage,
    TextChannel,
  } from 'discord.js';
  
  export function onMessageDelete(client: Client) {
    client.on(Events.MessageDelete, async (message: Message | PartialMessage) => {
      if (!message.guild || message.partial) return;
  
      const logChannel = message.guild.channels.cache.find(
        ch => ch.isTextBased() && ch.name === 'deleted-message-log'
      ) as TextChannel;
  
      if (!logChannel) return;
  
      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 6,
        type: AuditLogEvent.MessageDelete,
      });
  
      const deletionLog = fetchedLogs.entries.find(entry =>
        entry.target?.id === message.author?.id &&
        entry.createdTimestamp > Date.now() - 5000
      );
  
      const deleter = deletionLog?.executor
        ? `<@${deletionLog.executor.id}> (${deletionLog.executor.tag})`
        : 'Unknown';
  
      const author = message.author
        ? `<@${message.author.id}> (${message.author.tag})`
        : 'Unknown';
  
      const content = message.content || '[No content]';
  
      await logChannel.send({
        content: `🗑️ **Message deleted**\n**Author**: ${author}\n**Deleted by**: ${deleter}\n**Content**:\n\`\`\`${content}\`\`\``,
      });
    });
  }