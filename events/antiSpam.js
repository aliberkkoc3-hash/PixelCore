const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

// Kullanıcıların mesaj geçmişini hafızada tutmak için bir Map oluşturuyoruz
const userData = new Map();

const LIMIT = 4; // 3 saniye içinde atılabilecek maksimum mesaj sayısı
const TIME_WINDOW = 3000; // Milisaniye cinsinden zaman dilimi (3 saniye)

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Muaf Tutulacak Kişiler: Bot sahibi veya Mesajları Yönet yetkisi olanlar
        if (message.author.id === config.botOwner || message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return;
        }

        const userId = message.author.id;
        const now = Date.now();

        if (!userData.has(userId)) {
            // Kullanıcı ilk defa yazıyorsa kaydet
            userData.set(userId, {
                timestamps: [now],
                warned: false
            });
            return;
        }

        const userRecord = userData.get(userId);
        
        // Zaman penceresinin dışındaki eski mesaj kayıtlarını temizle
        userRecord.timestamps = userRecord.timestamps.filter(time => now - time < TIME_WINDOW);
        
        // Yeni mesajın zaman damgasını ekle
        userRecord.timestamps.push(now);

        // Eğer belirlenen sürede limit aşılmışsa
        if (userRecord.timestamps.length > LIMIT) {
            try {
                // Spam yapanın attığı mesajı sil
                await message.delete();

                // Eğer kullanıcıyı bu spam turunda henüz uyarmadıysak uyaralım
                if (!userRecord.warned) {
                    userRecord.warned = true;
                    const warnMsg = await message.channel.send(`🚨 <@${userId}>, çok hızlı yazıyorsun kanka, biraz yavaşla! (Spam Yasaktır)`);
                    
                    // 5 saniye sonra uyarıyı sil
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
                }
            } catch (error) {
                console.error('[Anti-Spam/Error]: Spam mesajı silinemedi.', error);
            }
        } else {
            // Limit altındaysa uyarı durumunu sıfırla
            userRecord.warned = false;
        }

        // Güncellenen kaydı Map'e geri yaz
        userData.set(userId, userRecord);
    }
};