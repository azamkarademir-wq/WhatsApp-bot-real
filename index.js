const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const P = require('pino');
const app = express();
app.get('/', (req, res) => res.send('Bot aktif'));
app.listen(process.env.PORT || 3000, () => console.log('Site Live'));
async function start() {
  console.log('Bot baslatiliyor...');
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, logger: P({ level: 'silent' }) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.qr) {
      console.log('QR GELDI');
      qrcode.generate(u.qr, { small: true });
    }
    if (u.connection === 'open') console.log('BAGLANDI');
  });
}
start();
