const { EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'play',
    description: 'Ses kanalında istenen şarkıyı veya çalma listesini oynatır.',
    async execute(message, args, client) {
        const player = useMainPlayer();
        const sarkiSorgusu = args.join(' ');

        // 1. Kullanıcının ses kanalında olup olmadığını kontrol et
        const sesKanali = message.member.voice.channel;
        if (!sesKanali) {
            return message.reply('⚠️ Kanka şarkı çalabilmem için önce bir ses kanalına girmelisin!');
        }

        // 2. Bot zaten başka bir ses kanalındaysa engelle
        const botSesKanali = message.guild.members.me.voice.channel;
        if (botSesKanali && botSesKanali.id !== sesKanali.id) {
            return message.reply('⚠️ Kanka benimle aynı ses kanalında olmalısın!');
        }

        if (!sarkiSorgusu) {
            return message.reply('⚠️ Hangi şarkıyı oynatıyoruz kanka? Örnek: `pixel-play Ceza Suspus` veya Spotify/YouTube linki.');
        }

        const beklemeMesaji = await message.reply('🔍 Şarkı aranıyor ve ses kanalına bağlanılıyor...');

        try {
            // Şarkıyı arat, ses kanalına bağlan ve oynatmayı başlat
            const { track } = await player.play(sesKanali, sarkiSorgusu, {
                nodeOptions: {
                    metadata: {
                        channel: message.channel,
                        client: client,
                        requestedBy: message.author
                    },
                    volume: 80,
                    leaveOnEnd: false,
                    leaveOnEmpty: true
                }
            });

            const embed = new EmbedBuilder()
                .setColor(0x1DB954) // Spotify Yeşili
                .setTitle('🎶 Şarkı Sıraya Eklendi / Oynatılıyor')
                .setDescription(`**[${track.title}](${track.url})**`)
                .addFields(
                    { name: '🎤 Sanatçı / Kanal', value: track.author || 'Bilinmiyor', inline: true },
                    { name: '⏱️ Süre', value: `\`${track.duration}\``, inline: true },
                    { name: '👤 İsteyen', value: `${message.author}`, inline: true }
                )
                .setThumbnail(track.thumbnail)
                .setTimestamp()
                .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

            beklemeMesaji.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error('[Play Komut Hatası]:', error);
            beklemeMesaji.edit('❌ Şarkı çalınırken veya ses kanalına bağlanırken bir sorun oluştu kanka.');
        }
    }
};