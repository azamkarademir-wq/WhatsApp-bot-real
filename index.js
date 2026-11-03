const express = require('express');
const app = express();
app.get('/', (req,res)=> res.send('Bot Live - QR icin Logs a bak'));
app.listen(process.env.PORT || 3000, ()=> console.log('Server OK'));

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ['Bot','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  console.log('QR bekleniyor...');
}
start();
