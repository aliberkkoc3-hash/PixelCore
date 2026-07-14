const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const whitelistPath = path.join(__dirname, '../data/whiteList.json');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        if (message.author.id === config.botOwner || message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return;
        }

        const linkRegex = /(https?:\/\/[^\s]+)/gi;

        if (linkRegex.test(message.content)) {
            let isAllowed = false;
            const lowerContent = message.content.toLowerCase();

            if (fs.existsSync(whitelistPath)) {
                try {
                    const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'));
                    isAllowed = whitelist.allowedDomains.some(domain => lowerContent.includes(domain.toLowerCase()));
                } catch (error) {
                    console.error('[Anti-Link/WhiteList/Error]:', error);
                }
            }

            if (!isAllowed) {
                try {
                    await message.delete();
                    const warnMsg = await message.channel.send(`⚠️ <@${message.author.id}>, bu link güvenli/izinli bulunmadığı için silindi kanka!`);
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
                } catch (error) {
                    console.error('[Anti-Link/Error]:', error);
                }
            }
        }
    }
};