require('dotenv').config({ silent: true });
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
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

// Console logging to Discord (غیرفعال شده طبق درخواست)
const CONSOLE_LOG_CHANNEL_ID = '';
const PANEL_LOG_CHANNEL_ID = '';
const panelAuthChallenges = new Map(); // challengeId => { code, expires }

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
    console.log('✅ Website Loaded');
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

// List registered global & guild application commands
app.get('/api/commands', async (req, res) => {
    if (!client.readyAt || !client.application) {
        return res.status(503).json({ success: false, error: 'Discord client not ready' });
    }

    try {
        const commands = await client.application.commands.fetch();
        const data = [];

        commands?.forEach(cmd => {
            data.push({
                id: cmd.id,
                name: cmd.name,
                description: cmd.description,
                type: cmd.type,
                options: Array.isArray(cmd.options)
                    ? cmd.options.map(opt => ({
                        name: opt.name,
                        description: opt.description,
                        type: opt.type,
                        required: opt.required || false
                    }))
                    : []
            });
        });

        data.sort((a, b) => a.name.localeCompare(b.name));

        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error fetching application commands:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch commands' });
    }
});

// List guild channels available to the bot (text-based only)
app.get('/api/channels', async (req, res) => {
    if (!client.readyAt) {
        return res.status(503).json({ success: false, error: 'Discord client not ready' });
    }

    const guildPayload = [];

    for (const guild of client.guilds.cache.values()) {
        const summary = {
            guildId: guild.id,
            guildName: guild.name,
            icon: guild.iconURL({ size: 64 }) || null,
            channels: []
        };

        try {
            const fetched = await guild.channels.fetch();
            const textChannels = [];

            fetched.forEach(channel => {
                if (!channel || typeof channel.isTextBased !== 'function') return;
                if (!channel.isTextBased()) return;
                if (channel.viewable === false) return;

                textChannels.push({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    parentId: channel.parentId || null,
                    parentName: channel.parent?.name || null,
                    topic: channel.topic || null,
                    nsfw: Boolean(channel.nsfw)
                });
            });

            textChannels.sort((a, b) => a.name.localeCompare(b.name));
            summary.channels = textChannels;
        } catch (error) {
            console.error(`❌ Error fetching channels for guild ${guild.name}:`, error);
            summary.error = 'Failed to fetch channels';
        }

        guildPayload.push(summary);
    }

    guildPayload.sort((a, b) => a.guildName.localeCompare(b.guildName));

    return res.json({ success: true, data: guildPayload });
});

// List roles for a guild (defaults to primary guild)
app.get('/api/roles', async (req, res) => {
    if (!client.readyAt) {
        return res.status(503).json({ success: false, error: 'Discord client not ready' });
    }

    const requestedGuildId = req.query.guildId || GUILD_ID;
    let guild = client.guilds.cache.get(requestedGuildId);
    if (!guild) {
        guild = await client.guilds.fetch(requestedGuildId).catch(() => null);
    }
    if (!guild) {
        return res.status(404).json({ success: false, error: 'Guild not found' });
    }

    try {
        await guild.roles.fetch();
    } catch (error) {
        console.error('❌ Error fetching roles:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch roles' });
    }

    const roles = guild.roles.cache
        .filter(role => role.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor && role.hexColor !== '#000000' ? role.hexColor : null,
            mentionable: role.mentionable,
            managed: role.managed,
            position: role.position
        }));

    return res.json({
        success: true,
        data: {
            guildId: guild.id,
            guildName: guild.name,
            roles
        }
    });
});

// Panel auth challenge: request code
app.post('/api/channel-auth/request', async (req, res) => {
    if (!client.readyAt) {
        return res.status(503).json({ success: false, error: 'Discord client not ready' });
    }
    try {
        const challengeId = crypto.randomUUID();
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expires = Date.now() + 5 * 60 * 1000;
        panelAuthChallenges.set(challengeId, { code, expires });
        await sendAuthCodeToLog(code, challengeId);
        return res.json({ success: true, challengeId, expires });
    } catch (error) {
        console.error('❌ Error creating auth challenge:', error);
        return res.status(500).json({ success: false, error: 'Failed to create auth challenge' });
    }
});

// Panel auth verification
app.post('/api/channel-auth/verify', (req, res) => {
    const { challengeId, code } = req.body || {};
    if (!challengeId || !code) {
        return res.status(400).json({ success: false, error: 'challengeId and code required' });
    }
    const entry = panelAuthChallenges.get(challengeId);
    if (!entry) {
        return res.status(400).json({ success: false, error: 'Challenge expired or invalid' });
    }
    if (Date.now() > entry.expires) {
        panelAuthChallenges.delete(challengeId);
        return res.status(400).json({ success: false, error: 'Challenge expired' });
    }
    if (String(entry.code).trim() !== String(code).trim()) {
        return res.status(400).json({ success: false, error: 'کد وارد شده صحیح نیست' });
    }
    panelAuthChallenges.delete(challengeId);

    const ip = getRequestIp(req);
    const userAgent = req.headers['user-agent'] || 'نامشخص';
    void sendAuthLoginLog(ip, userAgent).catch(() => {});

    return res.json({ success: true });
});

// Send a message to a selected channel as the bot
app.post('/api/channels/:channelId/message', async (req, res) => {
    if (!client.readyAt) {
        return res.status(503).json({ success: false, error: 'Discord client not ready' });
    }

    const channelId = req.params.channelId;
    const body = req.body || {};
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const embedInput = typeof body.embed === 'object' && body.embed !== null ? body.embed : {};
    const embedTitle = typeof embedInput.title === 'string' ? embedInput.title.trim() : '';
    const embedDescription = typeof embedInput.description === 'string' ? embedInput.description.trim() : '';
    const embedImageUrlRaw = typeof embedInput.imageUrl === 'string' ? embedInput.imageUrl.trim() : '';
    const embedImageUrl = embedImageUrlRaw && /^https?:\/\//i.test(embedImageUrlRaw) ? embedImageUrlRaw : '';
    const embedFooter = typeof embedInput.footer === 'string' ? embedInput.footer.trim() : '';
    const embedColorRaw = typeof embedInput.color === 'string' ? embedInput.color.trim() : '';
    const embedColor = normalizeHexColor(embedColorRaw);
    const hasEmbed = Boolean(embedTitle || embedDescription || embedImageUrl || embedFooter || embedColor);

    if (!channelId) {
        return res.status(400).json({ success: false, error: 'channelId is required' });
    }

    if (!content && !hasEmbed) {
        return res.status(400).json({ success: false, error: 'Message or embed content is required' });
    }

    let channel = client.channels.cache.get(channelId);
    if (!channel) {
        channel = await client.channels.fetch(channelId).catch(() => null);
    }

    if (!channel || typeof channel.isTextBased !== 'function' || !channel.isTextBased()) {
        return res.status(404).json({ success: false, error: 'Channel not found or not text-based' });
    }

    if (channel.viewable === false) {
        return res.status(403).json({ success: false, error: 'Bot cannot view this channel' });
    }

    const botMember = channel.guild?.members?.me;
    if (botMember) {
        const permissions = channel.permissionsFor(botMember);
        if (!permissions || !permissions.has('SendMessages')) {
            return res.status(403).json({ success: false, error: 'Bot lacks permission to send messages in this channel' });
        }
    }

    const payload = {};
    if (content) {
        payload.content = content.slice(0, 2000);
    }

    if (hasEmbed) {
        const embed = new EmbedBuilder();
        if (embedTitle) {
            embed.setTitle(embedTitle.slice(0, 256));
        }
        if (embedDescription) {
            embed.setDescription(embedDescription.slice(0, 4096));
        }
        if (embedImageUrl) {
            embed.setImage(embedImageUrl);
        }
        if (embedFooter) {
            embed.setFooter({ text: embedFooter.slice(0, 2048) });
        }
        if (embedColor) {
            embed.setColor(embedColor);
        }
        payload.embeds = [embed];
    }

    try {
        await channel.send(payload);
        await logChannelPanelAction({
            guild: channel.guild,
            targetChannel: channel,
            content: payload.content || '',
            embedData: hasEmbed ? {
                title: embedTitle,
                description: embedDescription,
                imageUrl: embedImageUrl,
                footer: embedFooter,
                color: embedColor
            } : null
        }).catch(() => {});
        return res.json({ success: true });
    } catch (error) {
        console.error('❌ Error sending message to channel:', error);
        return res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

async function logChannelPanelAction({ guild, targetChannel, content, embedData }) {
    if (!PANEL_LOG_CHANNEL_ID) return;
    try {
        let logChannel = client.channels.cache.get(PANEL_LOG_CHANNEL_ID);
        if (!logChannel) {
            logChannel = await client.channels.fetch(PANEL_LOG_CHANNEL_ID).catch(() => null);
        }
        if (!logChannel || !logChannel.send) return;

        const safeContent = typeof content === 'string' ? content : '';
        const description = safeContent.length > 0
            ? (safeContent.length > 1024 ? `${safeContent.slice(0, 1021)}...` : safeContent)
            : '---';
        const fields = [
            { name: 'سرور', value: guild?.name ? `${guild.name} (${guild.id})` : 'نامشخص', inline: false },
            { name: 'چنل هدف', value: targetChannel ? `<#${targetChannel.id}> (${targetChannel.id})` : 'نامشخص', inline: false },
            { name: 'متن خارج از امبد', value: description || '---', inline: false }
        ];

        if (embedData) {
            const lines = [];
            if (embedData.title) lines.push(`**عنوان:** ${embedData.title}`);
            if (embedData.description) {
                const trimmed = embedData.description.length > 500 ? `${embedData.description.slice(0, 497)}...` : embedData.description;
                lines.push(`**توضیح:** ${trimmed}`);
            }
            if (embedData.footer) lines.push(`**فوتر:** ${embedData.footer}`);
            if (embedData.imageUrl) lines.push(`**تصویر:** ${embedData.imageUrl}`);
            if (embedData.color) lines.push(`**رنگ:** ${embedData.color}`);

            if (lines.length) {
                fields.push({ name: 'جزئیات امبد', value: lines.join('\n'), inline: false });
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ff88)
            .setTitle('📝 وب‌سایت - ارسال پیام')
            .addFields(fields)
            .setTimestamp(new Date());

        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ Failed to send panel log:', error);
    }
}

async function sendAuthCodeToLog(code, challengeId) {
    if (!PANEL_LOG_CHANNEL_ID) return;
    try {
        let logChannel = client.channels.cache.get(PANEL_LOG_CHANNEL_ID);
        if (!logChannel) {
            logChannel = await client.channels.fetch(PANEL_LOG_CHANNEL_ID).catch(() => null);
        }
        if (!logChannel || !logChannel.send) return;
        const embed = new EmbedBuilder()
            .setColor(0x00ff88)
            .setTitle('🔐 کد ورود جدید برای صفحه کانال‌ها')
            .setDescription(`کد یکبار مصرف: **${code}**\nChallenge ID: \`${challengeId}\``)
            .setFooter({ text: 'کد پس از 5 دقیقه منقضی می‌شود.' })
            .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ Failed to send auth code log:', error);
    }
}

async function sendAuthLoginLog(ip, userAgent) {
    if (!PANEL_LOG_CHANNEL_ID) return;
    try {
        let logChannel = client.channels.cache.get(PANEL_LOG_CHANNEL_ID);
        if (!logChannel) {
            logChannel = await client.channels.fetch(PANEL_LOG_CHANNEL_ID).catch(() => null);
        }
        if (!logChannel || !logChannel.send) return;
        const embed = new EmbedBuilder()
            .setColor(0xffc107)
            .setTitle('🔔 ادمین وارد پنل شد')
            .addFields(
                { name: 'آی‌پی', value: ip || 'نامشخص', inline: false },
                { name: 'سیستم / مرورگر', value: userAgent || 'نامشخص', inline: false }
            )
            .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ Failed to send auth login log:', error);
    }
}

function normalizeHexColor(value) {
    if (!value) return null;
    const cleaned = value.replace('#', '').trim();
    if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
        return `#${cleaned.toLowerCase()}`;
    }
    return null;
}

function getRequestIp(req) {
    return (
        req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'نامشخص'
    );
}

// Endpoint to receive suggestion form submissions
// این اندپوینت طبق درخواست لاگ و ارسال به دیسکورد را انجام نمی‌دهد و فقط موفقیت برمی‌گرداند
app.post('/api/submit-suggestion', async (req, res) => {
    return res.json({ success: true, message: 'suggestions disabled' });
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
