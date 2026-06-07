const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// HTML Panel
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px;">
            <h1>WhatsApp Bot Panel</h1>
            <input type="text" id="phone" placeholder="994501234567">
            <button onclick="getCode()">Kodu Al</button>
            <h2 id="res"></h2>
            <script>
                async function getCode() {
                    const phone = document.getElementById('phone').value;
                    document.getElementById('res').innerText = '...';
                    const r = await fetch('/code', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ phone })
                    });
                    const d = await r.json();
                    document.getElementById('res').innerText = d.code;
                }
            </script>
        </div>
    `);
});

// Kod alma hissəsi
app.post('/code', async (req, res) => {
    try {
        const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
        await mongoose.connect(MONGODB_URI);
        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
            authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
            puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        });

        // HƏR ŞEYİ QISA ETDİK:
        await client.initialize();
        
        // Birbaşa kodu sorğula (gözləmə əlavə etdik)
        setTimeout(async () => {
            try {
                const code = await client.requestPairingCode(req.body.phone);
                res.json({ code: "KOD: " + code });
            } catch (e) {
                res.json({ code: "Xəta: " + e.message });
            }
        }, 5000); 

    } catch (err) {
        res.json({ code: "Bağlantı xətası: " + err.message });
    }
});

app.listen(port);
