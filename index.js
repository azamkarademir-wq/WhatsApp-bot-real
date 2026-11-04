const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const express = require("express")
const fs = require("fs")
const app = express()
let sock
let qrCode = null

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")
    sock = makeWASocket({ auth: state, printQRInTerminal: false })
    
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode("905445089169")
                qrCode = code?.match(/.{1,4}/g)?.join("-") || code
                console.log("KOD:", qrCode)
            } catch(e){ console.log(e) }
        }, 5000)
    }
    
    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("connection.update", (u) => {
        if (u.connection === "open") console.log("Baglandi")
        if (u.connection === "close") startBot()
    })
    
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if (text.toLowerCase().includes("bot")) {
            await sock.sendMessage(msg.key.remoteJid, { text: "BOT AKTIF Azam!" })
        }
    })
}

app.get("/", (req,res) => res.send("OK - /kod a git"))
app.get("/kod", (req,res) => res.send(qrCode ? `<h1 style="font-size:50px;text-align:center;margin-top:100px">${qrCode}</h1>` : "Kod bekleniyor, 10 sn sonra yenile"))
app.get("/yenile", (req,res) => {
    try { fs.rmSync("auth_info_baileys", { recursive: true, force: true }) } catch(e){}
    qrCode = null
    res.send("Silindi - 10 sn sonra /kod a git")
    setTimeout(() => startBot(), 2000)
})

app.listen(10000, () => { startBot() })
