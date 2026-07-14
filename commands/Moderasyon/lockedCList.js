const { PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'lockedlist',
    description: 'Kilitli olan tüm kanalları veya belirtilen tek kanalı listeler.',
    async execute(message, args, client) {
        // Yetki Kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels) && message.author.id !== config.botOwner) {
            return message.reply('❌ Bu listeyi görmek için yetkin yetersiz kanka.');
        }

        const embed = {
            color: 0x5865F2, // PixelCore Mavi tonu
            footer: {
                text: `PixelCore`,
                icon_url: client.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        // Eğer komutun yanına bir kanal etiketlendiyse ya da ID girildiyse (örn: pixel-lockedlist #kanal)
        // argüman yoksa ama config.json içinde "lockedListC" doluysa ve kullanıcı "all" veya "hepsi" yazmadıysa tek kanala baksın
        let targetChannel = null;

        if (args[0]) {
            // Mesajda etiketlenen ilk kanalı al veya yazılan ID ile kanalı bul
            const channelId = args[0].replace(/[<#>]/g, '');
            targetChannel = message.guild.channels.cache.get(channelId);
        } else if (config.lockedListC) {
            // Argüman girilmemiş ama config'de varsayılan bir izleme kanalı tanımlanmışsa onu hedef alalım
            targetChannel = message.guild.channels.cache.get(config.lockedListC);
        }

        // --- SENARYO 1: Tek Bir Kanal Kontrolü ---
        if (targetChannel && targetChannel.type === ChannelType.GuildText) {
            const overwrite = targetChannel.permissionOverwrites.cache.get(message.guild.roles.everyone.id);
            const isLocked = overwrite && overwrite.deny.has(PermissionFlagsBits.SendMessages);

            embed.title = '📊 Kanal Durum Kontrolü';
            embed.color = isLocked ? 0xED4245 : 0x57F287; // Kilitliyse kırmızı, açıksa yeşil

            if (isLocked) {
                embed.description = `🚨 <#${targetChannel.id}> kanalı şu anda **mesaj gönderimine kapalı (KİLİTLİ)** durumda!`;
            } else {
                embed.description = `✅ <#${targetChannel.id}> kanalı şu anda **mesaj gönderimine açık (AKTİF)** durumda!`;
            }

            return message.reply({ embeds: [embed] });
        }

        // --- SENARYO 2: Sunucudaki Tüm Kanalların Kontrolü (Varsayılan) ---
        const channels = message.guild.channels.cache;
        
        const lockedChannels = channels.filter(channel => {
            if (channel.type !== ChannelType.GuildText) return false;
            const overwrite = channel.permissionOverwrites.cache.get(message.guild.roles.everyone.id);
            return overwrite && overwrite.deny.has(PermissionFlagsBits.SendMessages);
        });

        embed.title = '🔒 Kilitli Kanallar Listesi';

        if (lockedChannels.size === 0) {
            embed.description = 'Şu anda sunucuda kilitli herhangi bir yazı kanalı bulunmuyor. Her yer açık! 🔓';
        } else {
            const channelList = lockedChannels.map(channel => `• <#${channel.id}>`).join('\n');
            embed.description = `Şu anda aşağıda listelenen **${lockedChannels.size}** kanal mesaj gönderimine kapalı:\n\n${channelList}`;
        }

        return message.reply({ embeds: [embed] });
    }
};