require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.on('new_chat_members', async (ctx) => {
  for (const member of ctx.message.new_chat_members) {
    const p = await ctx.promoteChatMember(member.id, {
      is_anonymous: true,
    });
    if(p)
      console.log('Promoted ' + member.username);
  }
})
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
