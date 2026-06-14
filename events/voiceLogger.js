const config = require('../config.json');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, client) {
        const logChannel = newState.guild.channels.cache.get(config.voiceLogChannel);
        if (!logChannel) return;

        const member = newState.member || oldState.member;
        if (!member) return;

        let embed;

        // Ses kanalına katılma
        if (!oldState.channelId && newState.channelId) {
            embed = {
                color: 0x00FF00,
                title: '🎤 Ses Kanalına Katıldı',
                description: `${member} (\`${member.id}\`) **${newState.channel.name}** kanalına katıldı.`,
                footer: { text: 'PixelCore Voice Log' },
                timestamp: new Date()
            };
        } 
        // Ses kanalından ayrılma
        else if (oldState.channelId && !newState.channelId) {
            embed = {
                color: 0xFF0000,
                title: '🔇 Ses Kanalından Ayrıldı',
                description: `${member} (\`${member.id}\`) **${oldState.channel.name}** kanalından ayrıldı.`,
                footer: { text: 'PixelCore Voice Log' },
                timestamp: new Date()
            };
        }
        // Kanal değiştirme
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            embed = {
                color: 0xFFFF00,
                title: '🔄 Ses Kanalı Değiştirdi',
                description: `${member} (\`${member.id}\`) **${oldState.channel.name}** kanalından **${newState.channel.name}** kanalına geçti.`,
                footer: { text: 'PixelCore Voice Log' },
                timestamp: new Date()
            };
        }

        if (embed) {
            logChannel.send({ embeds: [embed] }).catch(console.error);
        }
    }
};