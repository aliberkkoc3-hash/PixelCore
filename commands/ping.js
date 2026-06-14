module.exports = {
    name: 'ping',
    description: 'Botun gecikme süresini gösterir.',
    execute(message, args, client) {
        const ping = client.ws.ping;
        
        message.reply(`🏓 Pong! Gecikme: **${ping}ms**`);
    }
};