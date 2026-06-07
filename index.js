const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Global dəyişənlər
let client = null;
let isInitializing = false;

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h1>WhatsApp Bot Panel</h1>
            <input type="text" id="phone" placeholder="994501234567" style="padding:10px; width:250px;">
            <button onclick="getCode()" style="padding:10px;">Kodu Al</button>
            <h2 id="result" style="color:#008080; margin-top:30px;"></h2>
            <script>
                async function getCode() {
                    const phone = document.getElementById('phone').value;
                    document.getElementById('result').innerText = 'Bot qoşulur... Bu proses 20-30 saniyə çəkə bilər.';
                    const res = await fetch('/get-code', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ phone })
                    });
                    const data = await res.json();
                    document.getElementById('result').innerText = data.code;
                }
            </script>
        </div>
    `);
});

app.post('/get-code', async (req, res) => {
    const { phone } = req.body;
    
    if (isInitializing) return res.json({ code: 'Bot artıq işə salınır, gözləyin...' });
    isInitializing = true;

    try {
        const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
        if (mongoose.connection.readyState === 0) await mongoose.connect(MONGODB_URI);
        
        const store = new MongoStore({ mongoose: mongoose });

        client = new Client({
            authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
            puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        });

        client.initialize();

        // 30 saniyə ərzində botun hazır olmasını gözləyirik
        const code = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Bot qoşulma vaxtı bitdi (Timeout)'));
            }, 30000);

            client.on('ready', async () => {
                clearTimeout(timeout);
                try {
                    const pairingCode = await client.requestPairingCode(phone);
                    resolve(pairingCode);
                } catch (e) {
                    reject(e);
                }
            });
        });

        res.json({ code: `KODUNUZ: ${code}` });
    } catch (err) {
        res.json({ code: 'Xəta: ' + err.message });
    } finally {
        isInitializing = false;
    }
});

app.listen(port, () => console.log(`Server ${port} portunda aktivdir.`));
