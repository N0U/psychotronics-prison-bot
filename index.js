require('dotenv').config();
const { Telegraf, Telegram } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));

bot.on('new_chat_members', async (ctx) => {
  for (const member of ctx.message.new_chat_members) {
    // Don't promote bots
    if(member.is_bot) {
      continue;
    }

    const p = await ctx.promoteChatMember(member.id, {
      is_anonymous: true,
    });
    if(p) {
      console.log('Promoted ' + member.username);
    }
    else {
      console.error('Cannot promote: ' + p);
    }
  }
})

bot.on('message', async (ctx) => {
  const { from, chat, message_id } = ctx.update.message;
  if(from.is_bot){
    return;
  }
  await ctx.deleteMessage(message_id);
  const p = await ctx.promoteChatMember(from.id, {
    is_anonymous: true,
  });
  if(p) {
    console.log('Promoted ' + member.username);
  }
  else {
    console.error('Cannot promote: ' + p);
  }
});

if(process.env.PROD) {
  console.log('Launch in prod mode');
  bot.launch({
    webhook: {
      domain: process.env.URL,
      port: Number(process.env.PORT),
    }
  })
} else {
  console.log('Launch in dev mode');
  bot.launch();
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
