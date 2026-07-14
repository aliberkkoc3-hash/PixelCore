const { EmbedBuilder } = require('discord.js');

// Aktif oyunları hafızada tutmak için Map
const aktifOyunlar = new Map();

module.exports = {
    name: 'sayı-tahmin',
    description: '1-100 arası tutulan sayıyı tahmin etme oyunu oynarsınız.',
    async execute(message, args, client) {
        const userId = message.author.id;

        if (aktifOyunlar.has(userId)) {
            return message.reply('⚠️ Zaten devam eden bir oyunun var kanka! Tahminini sohbete yazarak devam et.');
        }

        const tutulanSayi = Math.floor(Math.random() * 100) + 1;
        let hak = 7; // Toplam tahmin hakkı

        aktifOyunlar.set(userId, { tutulanSayi, hak });

        message.reply(`🎯 Aklımdan **1 ile 100 arasında** bir sayı tuttum! **7 hakkın** var. Tahminlerini doğrudan sohbete yazarak gönder (Sadece sayı yazman yeterli).`);

        // Kullanıcının sayı tahminlerini dinlemek için Collector oluşturuyoruz
        const filter = m => m.author.id === userId && !isNaN(m.content);
        const collector = message.channel.createMessageCollector({ filter, time: 60000 }); // 1 dakika süre limitli

        collector.on('collect', m => {
            const oyun = aktifOyunlar.get(userId);
            if (!oyun) return collector.stop();

            const tahmin = parseInt(m.content);
            oyun.hak--;

            if (tahmin === oyun.tutulanSayi) {
                m.reply(`🎉 Helal olsun kanka! Doğru tahmin ettin. Tuttuğum sayı: **${oyun.tutulanSayi}** idi! (Kalan hak: ${oyun.hak})`);
                aktifOyunlar.delete(userId);
                collector.stop();
            } else if (oyun.hak === 0) {
                m.reply(`😔 Hakkın bitti kanka! Kaybettin. Tuttuğum sayı: **${oyun.tutulanSayi}** idi.`);
                aktifOyunlar.delete(userId);
                collector.stop();
            } else if (tahmin < oyun.tutulanSayi) {
                m.reply(`📈 Daha **BÜYÜK** bir sayı söyle kanka! (Kalan hak: ${oyun.hak})`);
            } else {
                m.reply(`📉 Daha **KÜÇÜK** bir sayı söyle kanka! (Kalan hak: ${oyun.hak})`);
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && aktifOyunlar.has(userId)) {
                message.reply(`⏰ Süre bitti kanka! Sayı tahmin oyunu kapandı.`);
                aktifOyunlar.delete(userId);
            }
        });
    }
};