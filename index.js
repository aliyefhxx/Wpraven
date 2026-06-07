const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

// Render üçün yuxudan oyatmaq (Uptime üçün)
const app = express();
app.get('/', (req, res) => res.send('Bot aktivdir!'));
app.listen(process.env.PORT || 3000);

const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
const YOUR_NUMBER = '9955XXXXXXXX'; // Nömrəni bura yaz

mongoose.connect(MONGODB_URI).then(() => {
    console.log('MongoDB-yə qoşuldu!');
    
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new MongoStore({ store: store }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('ready', () => console.log('Bot hazırdır!'));

    client.on('qr', async (qr) => {
        try {
            const pairingCode = await client.requestPairingCode(YOUR_NUMBER);
            console.log('--- 8 Rəqəmli Kodunuz: ' + pairingCode + ' ---');
        } catch (err) {
            console.error('Kod alınarkən xəta:', err);
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
});
