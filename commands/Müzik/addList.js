const { EmbedBuilder } = require('discord.js');
const { useQueue, useMainPlayer } = require('discord-player');

module.exports = {
    name: 'addlist',
    description: 'Çalan müziği kesmeden sıraya yeni şarkı veya çalma listesi ekler.',
    async execute(message, args, client) {
        const player = useMainPlayer();
        const sarkiSorgusu = args.join(' ');

        // 1. Kullanıcı ses kanalında mı?
        const sesKanali = message.member.voice.channel;
        if (!sesKanali) {
            return message.reply('⚠️ Kanka sıraya şarkı ekleyebilmek için önce bir ses kanalına girmelisin!');
        }

        // 2. Aktif bir oynatma var mı?
        const queue = useQueue(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('⚠️ Şu an aktif çalan bir müzik yok kanka. Sıfırdan başlatmak için `pixel-play` kullanabilirsin.');
        }

        // 3. Bot ile kullanıcı aynı kanalda mı?
        const botSesKanali = message.guild.members.me.voice.channel;
        if (botSesKanali && botSesKanali.id !== sesKanali.id) {
            return message.reply('⚠️ Kanka benimle aynı ses kanalında olmalısın!');
        }

        if (!sarkiSorgusu) {
            return message.reply('⚠️ Kuyruğa ne ekliyoruz kanka? Örnek: `pixel-addList Sagopa Kajmer` veya Spotify linki.');
        }

        const beklemeMesaji = await message.reply('🔍 Şarkı aranıyor ve sıraya ekleniyor...');

        try {
            // Şarkıyı veya playlist'i arat ve var olan kuyruğa ekle
            const searchResult = await player.search(sarkiSorgusu, {
                requestedBy: message.author
            });

            if (!searchResult.hasTracks()) {
                return beklemeMesaji.edit('❌ Aradığın şarkı veya çalma listesi bulunamadı kanka.');
            }

            // Playlist mi yoksa tek şarkı mı ekleniyor kontrolü
            if (searchResult.playlist) {
                queue.addTrack(searchResult.playlist);
                
                const embed = new EmbedBuilder()
                    .setColor(0x1DB954)
                    .setTitle('📜 Çalma Listesi Sıraya Eklendi')
                    .setDescription(`**[${searchResult.playlist.title}](${searchResult.playlist.url})**`)
                    .addFields(
                        { name: '🎵 Şarkı Sayısı', value: `\`${searchResult.playlist.tracks.length}\``, inline: true },
                        { name: '👤 Ekleyen', value: `${message.author}`, inline: true }
                    )
                    .setThumbnail(searchResult.playlist.thumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

                return beklemeMesaji.edit({ content: null, embeds: [embed] });
            } else {
                const track = searchResult.tracks[0];
                queue.addTrack(track);

                const embed = new EmbedBuilder()
                    .setColor(0x1DB954)
                    .setTitle('➕ Şarkı Sıraya Eklendi')
                    .setDescription(`**[${track.title}](${track.url})**`)
                    .addFields(
                        { name: '🎤 Sanatçı / Kanal', value: track.author || 'Bilinmiyor', inline: true },
                        { name: '⏱️ Süre', value: `\`${track.duration}\``, inline: true },
                        { name: '🔢 Sıra Konumu', value: `\`#${queue.tracks.data.length}\``, inline: true }
                    )
                    .setThumbnail(track.thumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

                return beklemeMesaji.edit({ content: null, embeds: [embed] });
            }

        } catch (error) {
            console.error('[AddList Komut Hatası]:', error);
            beklemeMesaji.edit('❌ Şarkı sıraya eklenirken bir sorun oluştu kanka.');
        }
    }
};