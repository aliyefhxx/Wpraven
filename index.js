const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const YOUR_NUMBER = '+995544331949'; // Bura nömrəni yaz

client.on('ready', () => console.log('Bot hazırdır!'));

client.on('qr', async (qr) => {
    try {
        console.log('Qoşulma kodu alınır...');
        const pairingCode = await client.requestPairingCode(YOUR_NUMBER);
        console.log('------------------------------------------');
        console.log('Sizin 8 rəqəmli kodunuz: ' + pairingCode);
        console.log('------------------------------------------');
    } catch (err) {
        console.error('Kod alınmadı:', err);
    }
});

client.on('message', async msg => {
    if (msg.body === '.alive') {
        const sent = await msg.reply('Yüklənir...');
        await sent.edit('Ryhavean 🥷');
    }

    if (msg.body === '.km' && msg.hasQuotedMsg) {
        const quoted = await msg.getQuotedMessage();
        if (quoted.hasMedia) {
            const media = await quoted.downloadMedia();
            await client.sendMessage(msg.from, media, { caption: 'Ryhavean 🥷' });
        }
    }
});

client.initialize();
