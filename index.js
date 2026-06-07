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

let client = null;
let displayCode = 'Nömrəni daxil edin və kodu gözləyin...';

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h1>WhatsApp Bot Panel</h1>
            <form action="/get-code" method="POST">
                <input type="text" name="phone" placeholder="Nömrə (məs: 994501234567)" required style="padding:10px; width:250px;">
                <button type="submit" style="padding:10px;">Kodu Al</button>
            </form>
            <h2 style="color:#008080; margin-top:30px;">${displayCode}</h2>
        </div>
    `);
});

app.post('/get-code', async (req, res) => {
    const phoneNumber = req.body.phone;
    displayCode = 'Kod alınır, lütfən səhifəni 10 saniyədən sonra yeniləyin...';
    
    // Botu başlat
    initClient(phoneNumber);
    res.redirect('/');
});

async function initClient(phone) {
    const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
    const db = await mongoose.connect(MONGODB_URI);
    const store = new MongoStore({ mongoose: mongoose });

    client = new Client({
        authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
        puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });

    client.on('qr', () => {}); // QR-i gizlət
    client.on('ready', () => { displayCode = 'Bot artıq aktivdir! ✅'; });

    try {
        client.initialize();
        const code = await client.requestPairingCode(phone);
        displayCode = `KODUNUZ: ${code}`;
    } catch (err) {
        displayCode = 'Xəta: ' + err.message;
    }
}

app.listen(port, () => console.log(`Server ${port} portunda aktivdir.`));
