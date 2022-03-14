require('dotenv').config();
const { Telegraf, Telegram, Markup } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => ctx.reply('Привет'));

bot.command('delete', async (ctx) => {
  const { message } = ctx.update;
  const { reply_to_message: reply } = message;
  try {
    if(!reply) {
      await ctx.reply('Котик, я не понимаю что удалять. Вызови эту команду когда цитируешь нужное сообщение');
      return;
    }
    if(reply.chat.id !== message.chat.id) {
      await ctx.reply('Я не буду удалять сообщения из другого чата');
      return;
    }
    await Promise.all([
      await ctx.deleteMessage(reply.message_id),
      await ctx.deleteMessage(message.message_id),
    ]);
  } catch (error) {
    console.log('\tCannot delete message');
    console.error(error);
  }
});

async function tryToPromote(ctx, user) {
  if(user.is_bot) {
    return;
  }

  try {
    const member = await ctx.getChatMember(user.id);
    if (member.status === 'member') {
      await ctx.promoteChatMember(user.id, { is_anonymous: true });
    }
  } catch (error) {
    console.log('\tCannot promote');
    console.error(error);
  }
}

bot.on('new_chat_members', async (ctx) => {
  console.log('New chat members');
  for (const member of ctx.message.new_chat_members) {
    tryToPromote(ctx, member);
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
