require('dotenv').config();
const { Telegraf, Telegram, Markup } = require('telegraf');
const markdownEscape = require('markdown-escape');
const NEW_LINE = '\r\n';

const GROUP = process.env.GROUP;
const CHANNEL = process.env.CHANNEL;

const bot = new Telegraf(process.env.TOKEN);

const creatingThreads = {};

bot.start((ctx) => ctx.reply('Привет'));

bot.command('delete', async (ctx) => {
  console.log('Deleting message...');
  const { message } = ctx.update;
  const { reply_to_message: reply } = message;
  try {
    if(!reply) {
      await ctx.reply('Котик, я не понимаю что удалять. Вызови эту команду когда пишешь ответ на нужное сообщение');
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
  }
  catch (error) {
    console.log('\tCannot delete message');
    console.error(error);
  }
});

bot.command('thread', async (ctx) => {
  const { from, chat } = ctx.update.message;
  if(chat.type !== 'private') {
    await ctx.reply('Не так, котик. Чтобы создать новый тред пиши мне в личку');
    return;
  }

  creatingThreads[from.id] = { stage: 0 };
  await ctx.reply('Котик, введи тему треда');
});

async function createThread(ctx, title, text) {
  try {
    const tg = ctx.telegram;
    const messageText = `*${markdownEscape('=== ' + title + ' ===')}*${NEW_LINE}${markdownEscape(text)}`;
    const groupMessage = await tg.sendMessage(GROUP, messageText,{
      parse_mode: 'Markdown',
    });
    const groupMessageId = groupMessage.message_id;

    const reply_markup = Markup.inlineKeyboard([
      Markup.button.url('К треду', `https://t.me/c/${GROUP.slice(4)}/${groupMessageId}?thread=${groupMessageId}`)
    ]).reply_markup;
    await tg.sendMessage(CHANNEL, messageText, { parse_mode: 'Markdown', reply_markup: reply_markup });
    await tg.editMessageReplyMarkup(GROUP, groupMessageId, undefined, reply_markup);
    await ctx.reply('Котик, твой тред готов', { reply_markup: reply_markup });
  } catch(error) {
    console.log(error);
    await ctx.reply('Не повезло, не фортануло. Твой тред не создался');
  }
}

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
  const { message } = ctx.update;
  const { from, chat } = message;
  if(from.is_bot || chat.type !== 'private') {
    return;
  }

  const status = creatingThreads[from.id];
  if(status) {
    try {
      if(status.stage === 0) {
        creatingThreads[from.id] = { stage: 1, title: message.text };
        await ctx.reply('Молодец. Теперь введи текст для главного поста');
      } else if(status.stage === 1) {
        await createThread(ctx, status.title, message.text);
        delete creatingThreads[from.id];
      }
    } catch(error) {
      console.log(error);
      delete creatingThreads[from.id];
      await ctx.reply('Извини, что-то пошло не так. Попробуй ещё раз');
    }
  }
});
/*bot.on('text', async (ctx) => {
  const { from, chat, message_id } = ctx.update.message;
  if(from.is_bot || ctx.update.message.chat.type === 'private'){
    return;
  }
  console.log('Text from a new user');
  if(await tryToPromote(ctx, from)) {
    await ctx.deleteMessage(message_id);
    console.log('\tDelete message of promoted user');
  }
});*/

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
