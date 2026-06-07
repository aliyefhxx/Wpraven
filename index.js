const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
                    document.getElementById('result').innerText = 'Bot başladılır, kod hazırlanır...';
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
    try {
        const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
        
        if (mongoose.connection.readyState === 0) await mongoose.connect(MONGODB_URI);
        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
            authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
            puppeteer: { 
                headless: true, 
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            }
        });

        // 1. İnitializasiya
        await client.initialize();

        // 2. Timeout gözləmədən 5 saniyə sonra kodu sorğula (Brauzer açılışı üçün zaman)
        await new Promise(resolve => setTimeout(resolve, 8000));

        const code = await client.requestPairingCode(phone);
        
        // Botu işi bitəndən sonra söndürmürük, amma cavabı veririk
        res.json({ code: `KODUNUZ: ${code}` });

    } catch (err) {
        res.json({ code: 'Xəta: ' + err.message + ' (Render RAM-ı az ola bilər, yenidən cəhd edin)' });
    }
});

app.listen(port, () => console.log(`Server aktivdir.`));
