const config = require('../config.json');

// Spam koruması
const cooldowns = new Map();
const COOLDOWN_MS = 2000;

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) return;

        // Spam kontrolü
        const now = Date.now();
        const userId = message.author.id;
        
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + COOLDOWN_MS;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏳ ${timeLeft.toFixed(1)}s bekleyin.`)
                    .then(msg => setTimeout(() => msg.delete(), 3000))
                    .catch(() => {});
            }
        }

        cooldowns.set(userId, now);
        setTimeout(() => cooldowns.delete(userId), COOLDOWN_MS);

        // Komut parse
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Komutu bul ve çalıştır
        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('❌ Komut çalıştırılırken bir hata oluştu.').catch(() => {});
        }
    }
};