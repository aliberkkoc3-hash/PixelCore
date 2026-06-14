const config = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const unregisteredRole = member.guild.roles.cache.get(config.unregisteredRole);

        if (!unregisteredRole) {
            console.warn('⚠️ Unregistered Role ID\'si config\'de bulunamadı.');
            return;
        }

        try {
            await member.roles.add(unregisteredRole);
            console.log(`${member.user.tag} kullanıcısına ${unregisteredRole.name} rolü verildi.`);
        } catch (error) {
            console.error(`Rol verilirken hata oluştu (${member.user.tag}):`, error);
        }
    }
};