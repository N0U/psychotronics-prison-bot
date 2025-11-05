require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

bot.telegram.setMyCommands([
  { command: 'delete', description: 'Удалить сообщение анонимно' },
]);

bot.start((ctx) => ctx.reply('Привет v2 for Channels'));

bot.on('chat_join_request', async (ctx) => {
  try {
    console.log('New join chat_join_request');
    const { chat, from } = ctx.chatJoinRequest
    if (from.is_bot) {
      console.log('I wont aprove a clanker');
      return;
    }
    console.log(`${from.first_name} try to join ${chat.title}`);
    await ctx.approveChatJoinRequest(from.id);
    await ctx.promoteChatMember(from.id, {
      is_anonymous: true,
      can_post_messages: true,
    });
  } catch (error) {
    console.log('\tchat_join_request failed');
    console.error(error);
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
process.once('SIGINT', () => {
  bot.stop('SIGINT');
 });
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});
