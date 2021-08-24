require('dotenv').config();
const { Telegraf, Telegram } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));

bot.command('delete', async (ctx) => {
  console.log('Deleting message...');
  const { message } = ctx.update;
  const { reply_to_message: reply } = message;
  try {
    if(!reply) {
      await ctx.reply('Reply message to delete');
      return;
    }
    if(reply.chat.id !== message.chat.id) {
      await ctx.reply('Cannot delete message from another chat');
      return;
    }
    await Promise.all([
      await ctx.deleteMessage(reply.message_id),
      await ctx.deleteMessage(message.message_id),
    ]);
  }
  catch (error) {
    console.log('\tCannot delete message');
    console.error(error);
  }
});

async function tryToPromote(ctx, user) {
  console.log('\tNew user: ' + user.username);
  // Don't promote bots
  if(user.is_bot) {
    console.log('\tIt is bot');
    return false;
  }

  try {
    const member = await ctx.getChatMember(user.id);
    if (member.status === 'member') {
      await ctx.promoteChatMember(user.id, { is_anonymous: true });
      console.log('\tPromoted');
      return true;
    } else {
      console.log('\tCannot promote ' + member.status);
      return false;
    }
  } catch (error) {
    console.log('\tCannot promote');
    console.error(error);
    return false;
  }
}

bot.on('new_chat_members', async (ctx) => {
  console.log('New chat members');
  for (const member of ctx.message.new_chat_members) {
    tryToPromote(ctx, member);
  }
})

bot.on('text', async (ctx) => {
  const { from, chat, message_id } = ctx.update.message;
  if(from.is_bot){
    return;
  }
  console.log('Text from a new user');
  if(await tryToPromote(ctx, from)) {
    await ctx.deleteMessage(message_id);
    console.log('\tDelete message of promoted user');
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
