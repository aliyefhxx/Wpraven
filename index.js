const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

let displayCode = 'Panel aktivdir. Nömrəni daxil edin.';

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h1>WhatsApp Bot Panel</h1>
            <form action="/get-code" method="POST">
                <input type="text" name="phone" placeholder="994501234567" required style="padding:10px; width:250px;">
                <button type="submit" style="padding:10px;">Kodu Al</button>
            </form>
            <h2 style="color:#008080; margin-top:30px;">${displayCode}</h2>
            <p>Kod alınanda səhifəni yeniləyin (F5).</p>
        </div>
    `);
});

app.post('/get-code', async (req, res) => {
    const phoneNumber = req.body.phone;
    displayCode = 'Bot işə salınır, zəhmət olmasa 10 saniyə gözləyin və səhifəni yeniləyin...';
    
    // Botu başlatmağı çağırırıq
    startBotProcess(phoneNumber);
    res.redirect('/');
});

async function startBotProcess(phone) {
    try {
        const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
        
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
        }

        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
            authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
            puppeteer: { 
                headless: true, 
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            }
        });

        // Bot hazır olanda kod sorğusunu göndər
        client.on('ready', async () => {
            console.log('Bot hazırdır, kod sorğulanır...');
        });

        // İnitializasiya et və bitməsini gözlə
        await client.initialize();

        // İndi sorğunu göndər
        const code = await client.requestPairingCode(phone);
        displayCode = `SİZİN 8 RƏQƏMLİ KODUNUZ: ${code}`;
        console.log('Alınan kod:', code);

    } catch (err) {
        displayCode = 'Xəta: ' + err.message;
        console.error('Xəta baş verdi:', err);
    }
}

app.listen(port, () => console.log(`Server ${port} portunda işləyir.`));
