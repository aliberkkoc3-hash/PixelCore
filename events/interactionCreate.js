const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'basvuru_onayla') {
            await interaction.reply({ content: `✅ Başvuru **${interaction.user.tag}** tarafından onaylandı!`, ephemeral: false });
            await interaction.message.edit({ components: [] });
        }

        if (interaction.customId === 'basvuru_reddet') {
            await interaction.reply({ content: `❌ Başvuru **${interaction.user.tag}** tarafından reddedildi.`, ephemeral: false });
            await interaction.message.edit({ components: [] });
        }
    },
};