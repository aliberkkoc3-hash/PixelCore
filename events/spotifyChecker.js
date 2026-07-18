const { ActivityType, EmbedBuilder } = require('discord.js');
const { Client: GeniusClient } = require('genius-lyrics');
const config = require('../config.json');

// Genius istemcisini başlatıyoruz
const genius = new GeniusClient(config.geniusToken);

// Kullanıcıların en son hangi şarkıda DM aldığını tutalım (Spam engeli)
const sonAtilanlar = new Map(); 

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('🟢 Genius API Destekli Spotify Takip Sistemi Aktif!');

        // KONTROL SÜRESİ: Her 10 dakikada bir sunucuyu tarar.
        // Test yaparken burayı geçici olarak 30000 (30 saniye) yapabilirsin kanka.
        const KONTROL_SURESI = 10 * 60 * 1000; 

        setInterval(async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    // Sunucudaki üyelerin durumlarını çekebilmek için fetchliyoruz
                    const members = await guild.members.fetch({ withPresences: true });

                    for (const member of members.values()) {
                        if (member.user.bot || !member.presence) continue;

                        // Spotify dinleyen aktiviteyi bul
                        const spotifyActivity = member.presence.activities.find(
                            act => act.name === 'Spotify' && act.type === ActivityType.Listening
                        );

                        if (spotifyActivity) {
                            const sarkiAdi = spotifyActivity.details; // Örn: Blinding Lights
                            const sanatci = spotifyActivity.state;    // Örn: The Weeknd
                            const userId = member.id;

                            // Kullanıcıya zaten bu şarkı için DM atıldıysa döngüyü geç
                            if (sonAtilanlar.get(userId) === sarkiAdi) continue;

                            try {
                                // Genius'ta şarkıyı aratıyoruz
                                const aramalar = await genius.songs.search(`${sanatci} ${sarkiAdi}`);
                                const ilkSarki = aramalar[0];

                                if (!ilkSarki) continue; // Genius'ta bulunamadıysa es geç

                                // Şarkı sözlerini çekiyoruz
                                const lyrics = await ilkSarki.lyrics();
                                
                                // Sözleri satırlara bölüp temizleyelim (boş satırları ve [Verse], [Chorus] gibi ibareleri uçuralım)
                                const satirlar = lyrics.split('\n')
                                    .map(s => s.trim())
                                    .filter(s => s.length > 0 && !s.startsWith('['));

                                if (satirlar.length === 0) continue;

                                // Şarkı sözlerinin içinden rastgele bir başlangıç noktası seçip ardışık 3 satır alalım
                                const rastgeleIndex = Math.floor(Math.random() * Math.max(1, satirlar.length - 3));
                                const secilenSozler = satirlar.slice(rastgeleIndex, rastgeleIndex + 3).join('\n');

                                // Şık bir embed kartı hazırlayalım
                                const embed = new EmbedBuilder()
                                    .setColor(0x1DB954) // Spotify Yeşili
                                    .setTitle(`🎧 Kulağıma Çalındı da...`)
                                    .setDescription(`Baktım Spotify'da **${sanatci} - ${sarkiAdi}** dinliyorsun kanka. Şarkının şu kısmı tam sana göre değil mi?`)
                                    .addFields({
                                        name: '🎵 Şarkıdan Bir Parça:',
                                        value: `\`\`\`text\n${secilenSozler}\n\`\`\``
                                    })
                                    .setThumbnail(ilkSarki.thumbnail) // Şarkının kapak fotoğrafını ekliyoruz!
                                    .setFooter({ text: 'PixelCore Spotify Günlüğü', iconURL: client.user.displayAvatarURL() })
                                    .setTimestamp();

                                // DM Gönderimi
                                await member.send({ embeds: [embed] });
                                console.log(`[Genius DM] ${member.user.tag} kullanıcısına "${sarkiAdi}" sözleri gönderildi.`);
                                
                                // Hafızaya kaydet ki darlamasın
                                sonAtilanlar.set(userId, sarkiAdi);

                            } catch (geniusError) {
                                console.error(`[Genius Arama Hatası] ${sarkiAdi} için sözler çekilemedi:`, geniusError.message);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Spotify Döngü Hatası]:', error);
                }
            }
        }, KONTROL_SURESI);
    }
};