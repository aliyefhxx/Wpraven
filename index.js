const { Client } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongodb');
const mongoose = require('mongoose');

const MONGODB_URI = 'BURA_MONGO_CONNECTION_STRING_YAZ'; // Atlas-dan aldığın link

mongoose.connect(MONGODB_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new MongoStore({ store: store }),
        puppeteer: { args: ['--no-sandbox'] }
    });

    client.on('ready', () => console.log('Bot hazırdır!'));

    client.on('qr', async (qr) => {
        const pairingCode = await client.requestPairingCode('9955XXXXXXXX'); // Nömrən
        console.log('Kod: ' + pairingCode);
    });

    client.on('message', async msg => {
        if (msg.body === '.alive') {
            const sent = await msg.reply('...');
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
});

// Uptime üçün sadə bir express server (Render yatmasın deyə)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot aktivdir!'));
app.listen(process.env.PORT || 3000);
