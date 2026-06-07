const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Kodun web səhifəsində görünməsi üçün dəyişən
let displayCode = 'Kod hələ alınır, bir az gözləyin...';

// Web server: Linkə daxil olanda kodu göstərir
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h1>WhatsApp Bot Kodunuz</h1>
            <h2 style="color:#008080; font-size:50px;">${displayCode}</h2>
            <p>Kod görünmürsə, səhifəni yeniləyin.</p>
        </div>
    `);
});

app.listen(port, () => console.log(`Server ${port} portunda aktivdir.`));

const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
const YOUR_NUMBER = '9955XXXXXXXX'; // Nömrəni bura yaz!

mongoose.connect(MONGODB_URI).then(async () => {
    console.log('MongoDB-yə qoşuldu!');
    
    const store = new MongoStore({ mongoose: mongoose });
    
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('ready', () => console.log('Bot hazırdır!'));

    client.on('qr', async (qr) => {
        try {
            const pairingCode = await client.requestPairingCode(YOUR_NUMBER);
            displayCode = pairingCode; // Kodu dəyişənə atırıq
            console.log('--- 8 RƏQƏMLİ KODUNUZ: ' + pairingCode + ' ---');
        } catch (err) {
            displayCode = 'Xəta: ' + err.message;
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
