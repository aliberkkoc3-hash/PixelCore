const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express'); // Web sunucusu için gerekli
require('dotenv').config();

// Discord bağlantı ayarları (Render/HF için kritik)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    rest: {
        timeout: 30000,
        retries: 5
    },
    ws: {
        large_threshold: 50
    }
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

//  WEB SUNUCUSU (RENDER İÇİN ZORUNLU!)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('PixelCore is alive! 🚀');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda çalışıyor.`);
});

// Botu başlat
client.login(process.env.TOKEN);

// Düzgün kapatma
process.on('SIGINT', () => {
    console.log('\n🛑 PixelCore kapatılıyor...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 PixelCore kapatılıyor...');
    client.destroy();
    process.exit(0);
});