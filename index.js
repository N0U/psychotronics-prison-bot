require('dotenv').config();
const { Telegraf } = require('telegraf');

const TOKEN = process.env.TOKEN;
const PROD = process.env.PROD;

const bot = new Telegraf(TOKEN);

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

if(PROD) {
  console.log('Launch in prod mode');
  console.log(process.env);
  const PORT = process.env.PORT;
  const URL = process.env.APP_URL;
  /*bot.launch({
    webhook: {
      domain,
      port: Number(process.env.PORT),
    }
  })*/
} else {
  console.log('Launch in dev mode');
  bot.launch();
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
