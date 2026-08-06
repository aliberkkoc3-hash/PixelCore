const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // PixelPulse web arayüzünün erişebilmesi için
require('dotenv').config();

// 1. Bot İstemcisi (Client) Kurulumu
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences   // Spotify/Aktivite takibi için
    ]
});

client.commands = new Collection();

// 2. Event (Etkinlik) Yükleyici
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// 3. Komut Yükleyici
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    // Önce commands içindeki klasörleri (kategorileri) oku
    const commandFolders = fs.readdirSync(commandsPath);
    
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Eğer bu bir klasörse içindeki .js dosyalarını oku
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                // Komutun hangi kategoriye ait olduğunu koda otomatik ekleyelim
                command.category = folder; 
                
                client.commands.set(command.name, command);
            }
        }
    }
}

// 4. Minimalist Web Sunucusu & PixelPulse API
const app = express();
const PORT = process.env.PORT || 3000;

// PixelPulse web sayfasının bu API'ye erişebilmesi için CORS izni
app.use(cors());

// Çalışma süresini okunabilir formata dönüştüren yardımcı fonksiyon
function getFormattedUptime() {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

// Ana Sayfa Rotaları
app.get('/', (req, res) => {
    res.send('💚 PixelCore aktif ve canavar gibi çalışıyor!');
});

// PixelPulse Status Page API Endpoint'i
app.get('/api/status', (req, res) => {
    res.json({
        bot: 'PixelCore',
        status: client.ws.ping ? 'online' : 'starting',
        ping: client.ws.ping || 0,
        uptime: getFormattedUptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda aktif.`);
});

// 5. Botu Başlat
client.login(process.env.TOKEN);

// Güvenli Kapatma Sistemi
const stopBot = () => {
    console.log('\n🛑 PixelCore kapatılıyor...');
    client.destroy();
    process.exit(0);
};
process.on('SIGINT', stopBot);
process.on('SIGTERM', stopBot);