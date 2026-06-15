const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    rest: { timeout: 30000, retries: 5 },
    ws: { large_threshold: 50 }
});

client.commands = new Collection();

// Eventleri yükle
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// Komutları yükle
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.name, command);
    }
}

// EXPRESS WEB SUNUCUSU & ADMIN PANELİ
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "SENIN_SIFREN_BURAYA"; // BURAYI DEĞİŞTİR!

// Basit Admin Paneli Endpoint'i
app.get('/admin', async (req, res) => {
    const { pass, userId, name, age } = req.query;
    
    // Şifre kontrolü veya form gösterimi
    if (!pass || pass !== ADMIN_PASSWORD) {
        return res.send(`
            <html><body style="background:#1a1a1a;color:white;font-family:sans-serif;text-align:center;padding-top:50px;">
                <h2>🔒 PixelCore Remote Admin</h2>
                <form method="GET" action="/admin">
                    <input type="password" name="pass" placeholder="Admin Şifresi" required style="padding:10px;margin:5px;width:80%;"><br>
                    <input type="text" name="userId" placeholder="Kullanıcı ID (Sağ tık > ID Kopyala)" style="padding:10px;margin:5px;width:80%;"><br>
                    <input type="text" name="name" placeholder="Yeni İsim" style="padding:10px;margin:5px;width:80%;"><br>
                    <input type="text" name="age" placeholder="Yaş" style="padding:10px;margin:5px;width:80%;"><br>
                    <button type="submit" style="padding:12px 30px;background:#5865F2;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:10px;font-weight:bold;">Kayıt Yap</button>
                </form>
            </body></html>
        `);
    }

    // Kayıt İşlemi
    if (userId && name && age) {
        try {
            const guild = client.guilds.cache.first();
            if (!guild) throw new Error("Sunucu bulunamadı!");
            
            const member = await guild.members.fetch(userId);
            const regRole = guild.roles.cache.get(config.registeredRole);
            const unregRole = guild.roles.cache.get(config.unregisteredRole);
            
            if (unregRole && member.roles.cache.has(unregRole.id)) await member.roles.remove(unregRole);
            if (regRole) await member.roles.add(regRole);
            await member.setNickname(`${name} | ${age}`);
            
            res.send(`<h1 style="color:#4ade80;text-align:center;margin-top:50px;">✅ Kayıt Başarılı!</h1><p style="text-align:center;color:#aaa;">${name} | ${age} olarak kayıt edildi.</p><a href="/admin?pass=${pass}" style="color:white;text-align:center;display:block;margin-top:20px;">← Yeni Kayıt Yap</a>`);
        } catch (err) {
            res.send(`<h1 style="color:#f87171;text-align:center;margin-top:50px;">❌ Hata Oluştu</h1><p style="text-align:center;color:#aaa;">${err.message}</p><a href="/admin?pass=${pass}" style="color:white;text-align:center;display:block;margin-top:20px;">← Tekrar Dene</a>`);
        }
    } else {
        res.send(`<h1 style="text-align:center;margin-top:50px;">Lütfen tüm alanları doldurun.</h1><a href="/admin?pass=${pass}" style="color:white;text-align:center;display:block;margin-top:20px;">← Geri Dön</a>`);
    }
});

app.get('/', (req, res) => {
    res.send('PixelCore is alive! ');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda çalışıyor.`);
    console.log(`🔐 Admin Paneli: https://pixelcore-gp6l.onrender.com/admin`);
});

// Botu başlat
client.login(process.env.TOKEN);

// Güvenli kapatma
process.on('SIGINT', () => { console.log('\n🛑 PixelCore kapatılıyor...'); client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n🛑 PixelCore kapatılıyor...'); client.destroy(); process.exit(0); });