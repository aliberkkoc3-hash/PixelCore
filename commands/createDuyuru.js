const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'createDuyuru',
    description: 'Yeni bir duyuru oluşturur. (Sadece bot sahibi veya yetkili rol kullanabilir)',
    
    async execute(client, message, args) {
        // Yetki kontrolü: ownerId VEYA announcementControlRole
        const isOwner = message.author.id === config.ownerId;
        const hasRole = message.member.roles.cache.has(config.announcementControlRole);
        
        if (!isOwner && !hasRole) {
            return message.reply('❌ Bu komutu sadece bot sahibi veya duyuru yetkilisi kullanabilir!');
        }

        // Mesaj kontrolü
        if (args.length === 0) {
            return message.reply('❌ Lütfen bir duyuru metni girin!\nKullanım: `!createDuyuru <duyuru_metni>`');
        }

        const duyuruMetni = args.join(' ');
        const announcementChannelId = config.announcementLogChannel;

        // Kanal kontrolü
        const announcementChannel = client.channels.cache.get(announcementChannelId);
        
        if (!announcementChannel) {
            return message.reply('❌ Duyuru kanalı bulunamadı! Lütfen config dosyasını kontrol edin.');
        }

        // Duyuru embed'i oluştur
        const embed = new EmbedBuilder()
            .setTitle('📢 Yeni Duyuru')
            .setDescription(duyuruMetni)
            .setColor('#ff9900')
            .setTimestamp()
            .setFooter({ 
                text: `PixelCore | ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });

        try {
            // @everyone mention ile birlikte duyuruyu gönder
            await announcementChannel.send({
                content: '@everyone',
                embeds: [embed]
            });
            
            // Başarı mesajı
            await message.reply('✅ Duyuru başarıyla yayınlandı!');

        } catch (error) {
            console.error('Duyuru gönderme hatası:', error);
            await message.reply('❌ Duyuru gönderilirken bir hata oluştu!');
        }
    }
};