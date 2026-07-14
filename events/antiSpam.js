const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const { sendLog } = require('../utils/logger'); // Log sistemini çağırıyoruz

const userData = new Map();
const LIMIT = 4;
const TIME_WINDOW = 3000;

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        if (message.author.id === config.botOwner || message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return;
        }

        const userId = message.author.id;
        const now = Date.now();

        if (!userData.has(userId)) {
            userData.set(userId, {
                timestamps: [now],
                warned: false
            });
            return;
        }

        const userRecord = userData.get(userId);
        userRecord.timestamps = userRecord.timestamps.filter(time => now - time < TIME_WINDOW);
        userRecord.timestamps.push(now);

        if (userRecord.timestamps.length > LIMIT) {
            try {
                await message.delete();

                if (!userRecord.warned) {
                    userRecord.warned = true;
                    
                    const warnMsg = await message.channel.send(`🚨 <@${userId}>, çok hızlı yazıyorsun kanka, biraz yavaşla! (Spam Yasaktır)`);
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

                    // 🚨 YETKİLİ LOGU GÖNDERİLİYOR
                    await sendLog(
                        client,
                        'Spam Algılandı',
                        `**Kanal:** <#${message.channel.id}>\n**Kullanıcı:** <@${userId}>\n**Durum:** Limit aşıldı ve kullanıcının son mesajı temizlendi.`,
                        0xFFFF55, // Sarı renk
                        message.author
                    );
                }
            } catch (error) {
                console.error('[Anti-Spam/Error]: Spam mesajı silinemedi.', error);
            }
        } else {
            userRecord.warned = false;
        }

        userData.set(userId, userRecord);
    }
};