// Configuration for CLUBS Website
// Load environment variables
require('dotenv').config({ silent: true });

module.exports = {
    // Discord Bot Configuration
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN || 'your_discord_bot_token_here',
        guildId: process.env.GUILD_ID || 'your_discord_guild_id_here'
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },
    
    // Website Configuration
    website: {
        title: process.env.WEBSITE_TITLE || 'CLUBS - تیم گیمینگ',
        description: process.env.WEBSITE_DESCRIPTION || 'تیم گیمینگ حرفه‌ای - آماده برای CS2',
        discordInvite: process.env.DISCORD_INVITE || 'https://discord.gg/95ubwScKzH'
    },

    // Channel configuration
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID || '1400899603410321428'
};