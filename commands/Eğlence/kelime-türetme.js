const aktifKelimeler = new Map();

module.exports = {
    name: 'kelime-türetme',
    description: 'Botla kelime türetmece oynarsınız.',
    async execute(message, args, client) {
        const userId = message.author.id;

        if (aktifKelimeler.has(userId)) {
            return message.reply('⚠️ Devam eden bir oyunun var zaten kanka! Kelimeni yaz.');
        }

        const baslangicKelimeleri = ['pixel', 'sunucu', 'oyuncu', 'kodlama', 'discord', 'macera', 'ejderha'];
        const botKelime = baslangicKelimeleri[Math.floor(Math.random() * baslangicKelimeleri.length)];
        
        aktifKelimeler.set(userId, {
            sonHarf: botKelime.slice(-1).toLowerCase(),
            kullanilanlar: [botKelime],
            puan: 0
        });

        message.reply(`📝 Kelime türetmece başladı! Benim kelimem: **${botKelime.toUpperCase()}**.\n\nŞimdi son harf olan **"${botKelime.slice(-1).toUpperCase()}"** harfi ile başlayan bir kelime yaz kanka! (Süre: 45 saniye)`);

        const filter = m => m.author.id === userId && m.content.trim().length > 1;
        const collector = message.channel.createMessageCollector({ filter, time: 45000 });

        collector.on('collect', m => {
            const oyun = aktifKelimeler.get(userId);
            if (!oyun) return collector.stop();

            const userKelime = m.content.trim().toLowerCase();

            // İlk harf kontrolü
            if (userKelime.charAt(0) !== oyun.sonHarf) {
                return m.reply(`❌ Yanlış harf! Kelimeniz **"${oyun.sonHarf.toUpperCase()}"** harfiyle başlamalı kanka.`);
            }

            // Tekrarlanan kelime kontrolü
            if (oyun.kullanilanlar.includes(userKelime)) {
                return m.reply(`❌ Bu kelime daha önce kullanıldı kanka! Başka bir kelime dene.`);
            }

            // Başarılı tahmin! Puan ekle ve yeni harfi belirle
            oyun.puan += 10;
            oyun.kullanilanlar.push(userKelime);
            
            // Bot da hemen o kelimenin son harfiyle bir sonraki adımı güncelliyor
            const yeniSonHarf = userKelime.slice(-1).toLowerCase();
            oyun.sonHarf = yeniSonHarf;

            aktifKelimeler.set(userId, oyun);
            
            m.reply(`✅ Harika! Kelime kabul edildi. Güncel Puanın: **${oyun.puan}**\n👉 Şimdi sıradaki kelimen **"${yeniSonHarf.toUpperCase()}"** harfiyle başlamalı kanka! (Süre sıfırlandı)`);
            
            // Collector süresini her doğru kelimede sıfırlıyoruz
            collector.resetTimer();
        });

        collector.on('end', (collected, reason) => {
            const oyun = aktifKelimeler.get(userId);
            if (oyun) {
                message.channel.send(`⏰ Oyun bitti kanka! Toplam kazandığın puan: **${oyun.puan}** 🎉`);
                aktifKelimeler.delete(userId);
            }
        });
    }
};