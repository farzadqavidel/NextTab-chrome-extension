require('dotenv').config({ silent: true });
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');

const app = express();

// Silence specific deprecation about ready -> clientReady (discord.js v15 change)
process.on('warning', (warning) => {
    try {
        if (
            warning?.name === 'DeprecationWarning' &&
            typeof warning?.message === 'string' &&
            warning.message.includes('ready event has been renamed to clientReady')
        ) {
            return; // ignore this specific warning
        }
    } catch (_) {}
    // forward other warnings
    console.warn(warning);
});
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Discord Bot Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Discord Bot Token and Guild ID from environment variables
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Validate required environment variables
if (!DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_BOT_TOKEN environment variable is required');
    process.exit(1);
}

if (!GUILD_ID) {
    console.error('❌ GUILD_ID environment variable is required');
    process.exit(1);
}

// Store guild data
let guildData = {
    totalMembers: 0,
    onlineMembers: 0,
    admins: [],
    lastUpdate: null
};

// Console logging to Discord
const CONSOLE_LOG_CHANNEL_ID = '1431212488501887076';
const ORIGINAL_CONSOLE = { log: console.log, error: console.error, warn: console.warn, info: console.info, debug: console.debug };

function formatConsoleLine(level, message) {
    return message;
}

async function sendConsoleLog(level, message) {
    try {
        const clean = String(message || '').replace(/\s+$/,'').slice(0, 1900);
        if (!clean) return;

        if (!client?.user) return;
        const channelId = CONSOLE_LOG_CHANNEL_ID;
        if (!channelId) return;
        let ch = client.channels.cache.get(channelId);
        if (!ch) { try { ch = await client.channels.fetch(channelId); } catch { return; } }
        if (!ch || !ch.send) return;
        const line = formatConsoleLine(level, clean);
        await ch.send({ content: `\`\`\`\n${line}\n\`\`\`` });
    } catch (_) {}
}

// Override console methods to forward to Discord only (no console output)
for (const [level, fn] of Object.entries(ORIGINAL_CONSOLE)) {
    console[level] = function(...args) {
        const text = args.map(a => {
            try { return typeof a === 'string' ? a : JSON.stringify(a, null, 2); } catch { return String(a); }
        }).join(' ');
        // send asynchronously to avoid blocking and recursion
        setTimeout(() => { void sendConsoleLog(level, text); }, 0);
    };
}

// Discord Bot Events
client.once('clientReady', () => {
    console.log('✅ Website Discord bot connected');
    updateGuildData();
    
    // Update data every 5 minutes
    setInterval(updateGuildData, 5 * 60 * 1000);
});

client.on('guildMemberAdd', () => {
    // updateGuildData();
});

client.on('guildMemberRemove', () => {
    // updateGuildData();
});

client.on('presenceUpdate', () => {
    // updateGuildData();
});

// Function to update guild data
async function updateGuildData() {
    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            console.error('❌ Guild not found');
            return;
        }

        // Fetch all members
        await guild.members.fetch();

        // Count total members (excluding bots)
        const totalMembers = guild.memberCount;

        // Count online members
        let onlineMembers = 0;
        const adminList = [];

        // Roles that should be considered as admin-like for display
        const ADMIN_ROLE_IDS = [
            '1415440089047371897',
            '1400919880017907797',
            '1400910230358851686'
        ];

        guild.members.cache.forEach(member => {
            // Count online members (excluding bots)
            if (!member.user.bot && member.presence && 
                ['online', 'idle', 'dnd'].includes(member.presence.status)) {
                onlineMembers++;
            }

            // Determine admin inclusion: Administrator permission OR having one of ADMIN_ROLE_IDS
            const isAdminByPerm = member.permissions.has('Administrator');
            const isAdminByRole = ADMIN_ROLE_IDS.some(rid => member.roles.cache.has(rid));

            // Only include non-bot members that are currently online
            const isOnline = member.presence && ['online', 'idle', 'dnd'].includes(member.presence.status);
            if (!member.user.bot && isOnline && (isAdminByPerm || isAdminByRole)) {
                adminList.push({
                    id: member.user.id,
                    username: member.user.username,
                    displayName: member.displayName,
                    avatar: member.user.displayAvatarURL({ size: 64 }),
                    joinedAt: member.joinedAt
                });
            }
        });

        guildData = {
            totalMembers,
            onlineMembers,
            admins: adminList,
            lastUpdate: new Date()
        };

        // Suppressed specific log line per request
        
    } catch (error) {
        console.error('❌ Error updating guild data:', error);
    }
}

// API Routes
app.get('/api/discord-stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalMembers: guildData.totalMembers,
            onlineMembers: guildData.onlineMembers,
            adminCount: guildData.admins.length,
            admins: guildData.admins,
            lastUpdate: guildData.lastUpdate
        }
    });
});

// Get a single Discord user (and member info if available in the guild)
app.get('/api/user/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: 'Missing id' });

    try {
        // Fetch user globally
        const user = await client.users.fetch(id, { force: false });

        // Try to fetch guild member info (for displayName and guild avatar)
        let member = null;
        try {
            const guild = client.guilds.cache.get(GUILD_ID);
            if (guild) {
                const guildMember = await guild.members.fetch(id).catch(() => null);
                if (guildMember) {
                    member = {
                        id: guildMember.id,
                        displayName: guildMember.displayName,
                        avatar: guildMember.user.displayAvatarURL({ size: 64 }),
                        joinedAt: guildMember.joinedAt
                    };
                }
            }
        } catch (e) {
            member = null;
        }

        return res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.displayAvatarURL({ size: 64 }),
                member
            }
        });
    } catch (error) {
        return res.status(404).json({ success: false, error: 'User not found or bot not ready' });
    }
});

// Endpoint to receive suggestion form submissions and forward to Discord channel
app.post('/api/submit-suggestion', async (req, res) => {
    try {
        const { name, message, filelink } = req.body || {};
        if (!message || message.trim().length === 0) return res.status(400).json({ success:false, error: 'message required' });

        const channelId = '1431212488501887076'; // target suggestions channel (confirmed)
        const ch = await client.channels.fetch(channelId).catch(() => null);
        if (!ch || !ch.send) return res.status(500).json({ success:false, error: 'discord channel not available' });

        const username = name && name.trim().length ? name.trim() : 'Anonymous';
        // Build a nicer embed similar to website webhook style
        const { EmbedBuilder } = require('discord.js');
        const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || 'unknown';
        const embed = new EmbedBuilder()
            .setTitle('📨 پیشنهاد جدید از سایت')
            .setColor(0x00ff88)
            .addFields(
                { name: 'نام', value: username, inline: true },
                { name: 'پیام', value: message.length > 1024 ? message.slice(0,1021) + '...' : message, inline: false }
            )
            .setFooter({ text: `IP: ${ip}` })
            .setTimestamp(new Date());

        if (filelink && filelink.trim().length) {
            embed.addFields({ name: 'لینک فایل', value: filelink, inline: false });
        }

        // Send embed only (remove site link in content per request)
        await ch.send({ embeds: [embed] });
        return res.json({ success: true });
    } catch (error) {
        console.error('Error in submit-suggestion:', error);
        return res.status(500).json({ success:false, error: 'internal error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        discord: {
            ready: client.readyAt ? true : false,
            guild: guildData.totalMembers > 0
        }
    });
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, () => {
    console.log('✅ Website server started successfully!');
    
    // Login to Discord
    if (DISCORD_BOT_TOKEN && DISCORD_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
        client.login(DISCORD_BOT_TOKEN).catch(error => {
            console.error('❌ Failed to login to Discord:', error);
        });
    } else {
        console.warn('⚠️ Discord bot token not set. Set DISCORD_BOT_TOKEN environment variable.');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Website shutting down...');
    client.destroy();
    process.exit(0);
});

module.exports = app;
