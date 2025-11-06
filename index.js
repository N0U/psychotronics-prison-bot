const { Telegraf, Input } = require('telegraf');
const tls = require('tls');
const fs = require('fs');

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
	const ip = process.env.IP;
	const domain = process.env.DOMAIN;
	const port = Number(process.env.PORT);
	const key = process.env.KEY;
	const cert = process.env.CERT;

	if(!port || !key || !cert)
		throw new Error('Port, key or cert is missing');

  console.log('Launching in prod mode');
	
	const webhook = {
		port,
		path: '/tg-hook',
	 	certificate: Input.fromLocalFile(cert),
		tlsOptions: {
			key: fs.readFileSync(key),
			cert: fs.readFileSync(cert),
			rejectUnauthorized: true,
			minVersion: 'TLSv1.2',
  		maxVersion: 'TLSv1.3',			
		},
	}

	if(ip && ip !== '') {
		webhook.ipAddress = ip;
		webhook.domain = `${ip}:${port}`;
		console.log(`Set webhook to ip ${ip}:${port}`);
	}
	else if(domain && domain !== '') {
		webhook.domain = `${domain}:${port}`;
		console.log(`Set webhook to domain ${domain}:${port}`);
	}
	else
		throw new Error(`Got no ip or domain ('${ip}' '${domain}'`);

  bot.launch({
		webhook,
  }, () => console.log('Bot launched'));
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
