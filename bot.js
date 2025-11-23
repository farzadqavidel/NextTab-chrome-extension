const path = require('path');

// Set environment variable to suppress dotenv logs
process.env.DOTENV_CONFIG_QUIET = 'true';

// Store original console and stream methods BEFORE any overrides
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// Comprehensive dotenv log suppressor - blocks ALL dotenv messages
const suppressDotenvLogs = function(message) {
    if (!message) return true;
    const msg = String(message);
    // Block ANY message containing dotenv-related content - very aggressive filter
    if (msg.includes('[dotenv@') || 
        msg.includes('injecting env') || 
        msg.includes('from .env') ||
        msg.includes('dotenvx.com') ||
        msg.includes('https://dotenvx.com') ||
        msg.includes('-- tip:') ||
        msg.includes('--tip:') ||
        (msg.includes('tip:') && (msg.includes('dotenv') || msg.includes('suppress') || msg.includes('sync') || msg.includes('backup') || msg.includes('audit') || msg.includes('observability') || msg.includes('compliance') || msg.includes('custom object'))) ||
        msg.match(/\[dotenv@\d+\.\d+\.\d+\]/) || // Block version pattern
        (msg.includes('dotenv') && !msg.includes('DISCORD_BOT_TOKEN') && !msg.includes('token: ✅') && !msg.includes('token: ❌'))) {
        return false; // Completely suppress dotenv logs
    }
    return true; // Allow other logs
};

// Permanently override stdout to filter dotenv messages - MUST be before dotenv loads
process.stdout.write = function(chunk, encoding, fd) {
    const msg = chunk ? String(chunk) : '';
    if (!suppressDotenvLogs(msg)) {
        return true; // Completely block dotenv logs - return true to indicate success
    }
    return originalStdoutWrite(chunk, encoding, fd);
};

// Permanently override stderr to filter dotenv messages - MUST be before dotenv loads
process.stderr.write = function(chunk, encoding, fd) {
    const msg = chunk ? String(chunk) : '';
    if (!suppressDotenvLogs(msg)) {
        return true; // Completely block dotenv logs - return true to indicate success
    }
    return originalStderrWrite(chunk, encoding, fd);
};

// Permanently override console methods to filter dotenv messages - MUST be before dotenv loads
console.log = function(...args) {
    const message = args.join(' ');
    if (!suppressDotenvLogs(message)) return; // Block dotenv logs completely
    originalLog.apply(console, args);
};
console.info = function(...args) {
    const message = args.join(' ');
    if (!suppressDotenvLogs(message)) return; // Block dotenv logs completely
    originalInfo.apply(console, args);
};
console.warn = function(...args) {
    const message = args.join(' ');
    if (!suppressDotenvLogs(message)) return; // Block dotenv logs completely
    originalWarn.apply(console, args);
};
console.error = function(...args) {
    const message = args.join(' ');
    if (!suppressDotenvLogs(message)) return; // Block dotenv logs completely
    originalError.apply(console, args);
};

// Load dotenv - all logs will be filtered by the overrides above
// The overrides MUST be in place before this line executes
require('dotenv').config({ 
    path: path.join(__dirname, '.env'), 
    silent: true,
    debug: false
});

// Filters remain active permanently - do NOT restore console methods
// This ensures dotenv logs are blocked forever

console.log("token:", process.env.DISCORD_BOT_TOKEN ? "✅ find token" : "❌ where is token ?");
// Suppress specific deprecation warning about 'ready' renamed to 'clientReady'
process.on('warning', (warning) => {
    if (
        warning?.name === 'DeprecationWarning' &&
        typeof warning?.message === 'string' &&
        warning.message.includes('ready event has been renamed to clientReady')
    ) {
        return; // ignore this specific warning
    }
    console.warn(warning);
});
const { Client, GatewayIntentBits, EmbedBuilder, Collection, REST, Routes, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { fetch } = require('undici');
const config = require('./config');
const commands = require('./command');
const { TicketManager, ticketCommands } = require('./ticket');

const TEHRAN_TIMEZONE = 'Asia/Tehran';

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    rest: {
        timeout: 30000
    }
});







// --- Console Logging to Discord ---
const CONSOLE_LOG_CHANNEL_ID = '1430256356065018069';
// Use the original console methods (stored before dotenv filter) for Discord logging
const ORIGINAL_CONSOLE = { log: originalLog, error: originalError, warn: originalWarn, info: originalInfo, debug: console.debug };

function formatConsoleLine(level, message) {
    return message;
}

async function sendConsoleLog(level, message) {
    try {
        if (!CONSOLE_LOG_CHANNEL_ID || !client?.user) return;
        
        const clean = String(message || '').replace(/\s+$/,'').slice(0, 1900);
        if (!clean) return;

        let ch = client.channels.cache.get(CONSOLE_LOG_CHANNEL_ID);
        if (!ch) { 
            try { ch = await client.channels.fetch(CONSOLE_LOG_CHANNEL_ID); } 
            catch { return; } 
        }
        if (!ch || !ch.send) return;
        
        const line = formatConsoleLine(level, clean);
        await ch.send({ content: `\`\`\`\n${line}\n\`\`\`` });
    } catch (_) {}
}

// Override console methods to forward to Discord
for (const [level, fn] of Object.entries(ORIGINAL_CONSOLE)) {
    console[level] = function(...args) {
        try { fn.apply(console, args); } catch(_) {}
        const text = args.map(a => {
            try { return typeof a === 'string' ? a : JSON.stringify(a, null, 2); } catch { return String(a); }
        }).join(' ');
        // send asynchronously to avoid blocking and recursion
        setTimeout(() => { void sendConsoleLog(level, text); }, 0);
    };
}

setTimeout(() => { console.info('Console logger initialized. Streaming logs to Discord.'); }, 0);

// Create commands collection
client.commands = new Collection();
// In-memory reaction role mappings: messageId => { emojiKey: roleId }
client.reactionRoles = new Map();
// Auto reaction mappings
client.autoReactions = new Map(); // channelId => Set(emojiKeys)
client.autoReactSingle = new Map(); // messageId => Set(emojiKeys)
// Warnings storage: userId => [ { reason, moderatorTag, timestamp } ]
client.warns = new Map();
// Deduplication guards
client.handledGuildMemberAdds = new Set(); // memberId with TTL
client.handledInteractions = new Set(); // interactionId, short TTL
// Command usage tracking
client.commandUsage = new Map(); // commandName => count
client.dailyStats = {
	commands: 0,
	messages: 0,
	joins: 0,
	leaves: 0
};
// Throttle for console log of online member updates (once per hour)
client.lastOnlineCountConsoleLog = 0;

// --- Anti-Spam Manager ---
class AntiSpamManager {
    constructor(settings) {
        this.settings = settings || { enabled: false };
        this.userIdToWindow = new Map(); // userId => [ { t, content, meta } ]
        this.userIdToScore = new Map(); // userId => { score, last }
    }

    isExempt(message) {
        try {
            if (!this.settings.enabled) return true;
            if (!message?.member || !message?.guild) return true;
            const roleIds = message.member.roles?.cache?.keys ? Array.from(message.member.roles.cache.keys()) : [];
            if (this.settings.exemptRoleIds?.some(id => roleIds.includes(id))) return true;
            if (this.settings.exemptChannelIds?.includes(message.channelId)) return true;
            // بررسی کتگوری چنل برای معافیت تیکت‌ها
            if (this.settings.exemptCategoryIds?.includes(message.channel?.parentId)) return true;
            if (message.member?.permissions?.has?.('Administrator')) return true;
            return false;
        } catch (_) { return false; }
    }

    pushMessage(message) {
        const now = Date.now();
        const meta = this.extractMeta(message);
        const entry = { t: now, content: (message.content || '').trim(), meta };
        const arr = this.userIdToWindow.get(message.author.id) || [];
        arr.push(entry);
        // prune old
        const cutoff = now - (this.settings.windowMs || 7000);
        while (arr.length && arr[0].t < cutoff) arr.shift();
        this.userIdToWindow.set(message.author.id, arr);
        return arr;
    }

    extractMeta(message) {
        const content = (message.content || '');
        const mentions = (message.mentions?.users?.size || 0) + (message.mentions?.roles?.size || 0) + (message.mentions?.everyone ? 1 : 0);
        const links = (content.match(/https?:\/\/\S+/gi) || []).length;
        const emojis = (content.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu) || []).length;
        const letters = (content.replace(/[^a-zA-Z\p{L}]/gu, '') || '');
        const caps = (letters.match(/[A-Z\p{Lu}]/gu) || []).length;
        const ratio = letters.length ? caps / letters.length : 0;
        return { mentions, links, emojis, capsRatio: ratio };
    }

    similarity(a, b) {
        if (!a || !b) return 0;
        if (a === b) return 1;
        const len = Math.max(a.length, b.length);
        if (len === 0) return 1;
        let same = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) same++;
        return same / len;
    }

    computeViolations(message, windowEntries) {
        const s = this.settings;
        let score = 0;

        // Rate of messages
        if (windowEntries.length > (s.maxMessages || 6)) score += 2;

        // Duplicates / near-duplicates
        const contents = windowEntries.map(e => e.content).filter(Boolean);
        let dupCount = 0;
        for (let i = 1; i < contents.length; i++) {
            const sim = this.similarity(contents[i], contents[i - 1]);
            if (sim >= 0.9) dupCount++;
        }
        if (dupCount >= (s.maxDuplicates || 3)) score += 2;

        const last = windowEntries[windowEntries.length - 1];
        if (last) {
            if (last.meta.mentions > (s.maxMentionsPerMessage || 5)) score += 2;
            if (last.meta.emojis > (s.maxEmojisPerMessage || 15)) score += 1;
            if (last.meta.capsRatio > (s.maxCapsRatioPerMessage || 0.7) && (last.content || '').length >= 12) score += 1;
        }

        // Links in window
        const linkSum = windowEntries.reduce((acc, e) => acc + e.meta.links, 0);
        if (linkSum > (s.maxLinksPerWindow || 5)) score += 2;

        // Account and server age checks
        const accountAgeOk = Date.now() - (message.author?.createdTimestamp || 0) >= (s.minAccountAgeMs || 0);
        const joinedAt = message.member?.joinedTimestamp || 0;
        const serverAgeOk = Date.now() - joinedAt >= (s.minServerAgeMs || 0);
        if (!accountAgeOk) score += 1;
        if (!serverAgeOk) score += 1;

        return score;
    }

    async applyPunishment(message, totalScore) {
        try {
            const s = this.settings;
            const state = this.userIdToScore.get(message.author.id) || { score: 0, last: 0, step: 0 };
            // decay
            const decay = s.decayMs || 30 * 60 * 1000;
            const now = Date.now();
            const decayedScore = Math.max(0, state.score - Math.floor((now - state.last) / decay));
            const newScore = decayedScore + totalScore;
            state.score = newScore;
            state.last = now;

            // Choose step based on score thresholds
            // threshold: 2 -> warn, 4 -> 10m timeout, 6 -> 1h timeout, 8 -> kick
            const stepIndex = newScore >= 8 ? 3 : newScore >= 6 ? 2 : newScore >= 4 ? 1 : newScore >= 2 ? 0 : -1;
            if (s.stripRolesOnViolation) {
                await this.stripAllRoles(message).catch(() => {});
            }

            // If user is configured to only have roles stripped, skip further punishments
            const onlyStrip = Array.isArray(s.stripOnlyUserIds) && s.stripOnlyUserIds.includes(message.author.id);
            if (!onlyStrip && stepIndex > state.step) {
                state.step = stepIndex;
                this.userIdToScore.set(message.author.id, state);
                const step = s.punishments[stepIndex];
                await this.executeStep(message, step, newScore);
            } else {
                this.userIdToScore.set(message.author.id, state);
            }
        } catch (err) {
            console.error('❌ AntiSpam punishment error:', err?.message || err);
        }
    }

    async executeStep(message, step, score) {
        if (!step) return;
        const reason = `Anti-spam triggered (score=${score})`;
        try {
            switch (step.type) {
                case 'warn':
                    await message.reply({ content: '⚠️ لطفاً از ارسال پیام‌های پشت‌سرهم یا تکراری خودداری کنید.' }).catch(() => {});
                    break;
                case 'timeout': {
                    const ms = step.durationMs || 10 * 60 * 1000;
                    if (message.member?.moderatable) {
                        await message.member.timeout(ms, reason).catch(() => {});
                        await message.reply({ content: `⏳ شما برای ${(ms/60000)|0} دقیقه میوت شدید.` }).catch(() => {});
                    }
                    break;
                }
                case 'kick': {
                    if (message.member?.kickable) {
                        await message.member.kick(reason).catch(() => {});
                    }
                    break;
                }
                default:
                    break;
            }
        } catch (e) {
            console.error('❌ AntiSpam execute step error:', e?.message || e);
        }
    }

    async stripAllRoles(message) {
        try {
            const member = message.member;
            if (!member || !member.manageable) return;
            const me = message.guild?.members?.me;
            if (!me) return;
            const removable = member.roles.cache.filter(r => r.id !== message.guild.id && me.roles.highest.comparePositionTo(r) > 0);
            if (!removable.size) return;
            await member.roles.remove(Array.from(removable.keys()), 'Anti-spam violation: strip roles');
        } catch (e) {
            // ignore
        }
    }
}

const antiSpam = new AntiSpamManager(config.antiSpam);

// Add commands to collection
const commandList = [
    commands.avatarCommand,
    commands.clearCommand,
    commands.warnCommand,
    commands.warn2Command,
    commands.warnlistCommand,
    commands.clearwarnsCommand,
    commands.remindCommand,
    commands.timeCommand,
    commands.fortestCommand,
    commands.vipclbCommand,
    commands.clbCommand,
    commands.sayCommand,
    commands.serverinfoCommand,
    commands.userinfoCommand,
    commands.helpCommand,
    commands.reactionroleCommand,
    commands.autoreactionCommand,
    commands.sendCommand,
    commands.baninfoCommand,
    commands.membercountCommand,
    commands.roastCommand,
    commands.feedbackCommand,
    commands.bugCommand,
    ...ticketCommands
];

commandList.forEach(command => {
    client.commands.set(command.data.name, command);
});

// ایجاد مدیر تیکت
const ticketManager = new TicketManager(client);

// Voice channel the bot should always sit in (by ID)
const VOICE_CHANNEL_ID = '1414724634900824291';


// Helper to update online member count channel name (updates every 5 minutes, no logs)
async function updateOnlineMemberCountChannel() {
    try {
        const ONLINE_MEMBER_CHANNEL_ID = '1430248540088700989';
        let channel = client.channels.cache.get(ONLINE_MEMBER_CHANNEL_ID);
        if (!channel) {
            try { 
                channel = await client.channels.fetch(ONLINE_MEMBER_CHANNEL_ID).catch(() => null);
            } catch {}
            if (!channel) return;
        }
        
        if (!channel?.guild) return;
        
        const guild = channel.guild;
        let onlineCount = 0;
        
        // Count online members from cache (no fetch to avoid rate limits)
        // Only check cached members with presence data
        guild.members.cache.forEach(member => {
            if (!member.user.bot && member.presence && 
                ['online', 'idle', 'dnd'].includes(member.presence.status)) {
                onlineCount++;
            }
        });
        
        const desiredName = `「⚫」𝐎𝐧𝐥𝐢𝐧𝐞 :  ${onlineCount}`;
        if (channel.name !== desiredName) {
            try {
                await channel.setName(desiredName).catch(() => {});
            } catch {}
        }
    } catch (error) {
        // silent - no logs needed
    }
}

const SOLAR_DATE_CHANNEL_ID = '1440705278994550885';
function gregorianToJalali(date) {
    const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    let gy = date.getFullYear() - 1600;
    let gm = date.getMonth();
    let gd = date.getDate() - 1;

    let gDayNo = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
    for (let i = 0; i < gm; ++i) {
        gDayNo += gDaysInMonth[i];
    }
    if (gm > 1 && ((gy + 1600) % 4 === 0) && (((gy + 1600) % 100 !== 0) || ((gy + 1600) % 400 === 0))) {
        gDayNo++;
    }
    gDayNo += gd;

    let jDayNo = gDayNo - 79;

    const jNp = Math.floor(jDayNo / 12053);
    jDayNo %= 12053;

    let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
    jDayNo %= 1461;

    if (jDayNo >= 366) {
        jy += Math.floor((jDayNo - 1) / 365);
        jDayNo = (jDayNo - 1) % 365;
    }

    let jm = 0;
    for (; jm < 11 && jDayNo >= jDaysInMonth[jm]; ++jm) {
        jDayNo -= jDaysInMonth[jm];
    }
    const jd = jDayNo + 1;

    return { year: jy, month: jm + 1, day: jd };
}

async function updateSolarDateChannel() {
    try {
        if (!SOLAR_DATE_CHANNEL_ID) return;

        const nowTehran = new Date(new Date().toLocaleString('en-US', { timeZone: TEHRAN_TIMEZONE }));
        const { year, month, day } = gregorianToJalali(nowTehran);
        const desiredName = `「📅」${year}/${month}/${day}`;

        let channel = client.channels.cache.get(SOLAR_DATE_CHANNEL_ID);
        if (!channel) {
            try {
                channel = await client.channels.fetch(SOLAR_DATE_CHANNEL_ID);
            } catch {
                return;
            }
        }

        if (channel && channel.name !== desiredName) {
            await channel.setName(desiredName).catch(() => {});
        }
    } catch (error) {
        console.error('❌ Error updating solar date channel:', error?.message || error);
    }
}

// --- START: New Function for Bot Activity (Watching Status) ---
// Helper to update the bot's activity/status
async function updateBotActivity() {
    try {
        if (!client.user || client.guilds.cache.size === 0) {
            console.warn('⚠️ Cannot update activity: Client user not ready or no guilds cached.');
            return;
        }

        // Get main guild ID from environment variables
        const mainGuild = client.guilds.cache.get(process.env.GUILD_ID || config.discord.guildId);

        let memberCount = mainGuild?.memberCount || client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        // اطمینان از اینکه memberCount یک عدد است
        memberCount = typeof memberCount === 'number' ? memberCount : 0;
        
        const activityMessage = `CLUBS : ${memberCount} Member`;

        // Type 3 = Watching
        client.user.setActivity(activityMessage, { type: 3 }); 
        // Log removed per user request

    } catch (error) {
        console.error('❌ Error updating bot activity:', error?.message || error);
    }
}
// --- END: New Function for Bot Activity (Watching Status) ---


// Maintain a persistent voice connection to the specified voice channel
let voiceConnection = null;
async function connectToVoiceChannel() {
    try {
        
        
        let channel = client.channels.cache.get(VOICE_CHANNEL_ID);
        if (!channel) {
            console.log(`🔍 Channel not in cache, fetching...`);
            try { 
                channel = await client.channels.fetch(VOICE_CHANNEL_ID); 
                console.log(`✅ Channel fetched successfully: ${channel?.name || 'Unknown'}`);
            } catch (fetchError) {
                console.error(`❌ Failed to fetch channel ${VOICE_CHANNEL_ID}:`, fetchError?.message || fetchError);
                return;
            }
        }

        if (!channel) {
            console.error(`❌ Voice channel ${VOICE_CHANNEL_ID} not found`);
            return;
        }

        // ChannelType.GuildVoice = 2, GuildStageVoice = 13 (avoid importing ChannelType)
        if (channel.type !== 2 && channel.type !== 13) {
            console.error(`❌ Channel ${channel.name} (${channel.id}) is not a voice/stage channel. Type: ${channel.type}`);
            return;
        }


        // Check bot permissions in the channel
        const botMember = channel.guild.members.me;
        if (!botMember) {
            console.error(`❌ Bot member not found in guild`);
            return;
        }

        const permissions = channel.permissionsFor(botMember);
        if (!permissions) {
            console.error(`❌ Cannot get permissions for bot in channel ${channel.name}`);
            return;
        }

        if (!permissions.has('Connect')) {
            console.error(`❌ Bot lacks 'Connect' permission in channel ${channel.name}`);
            return;
        }

        if (!permissions.has('Speak')) {
            console.warn(`⚠️ Bot lacks 'Speak' permission in channel ${channel.name}, but will still connect`);
        }

        // Log فقط در صورت عدم وجود Speak
        if (permissions.has('Connect') && permissions.has('Speak')) {
        }
        

        // Disconnect existing connection if any
        if (voiceConnection) {
            console.log(`🔄 Disconnecting existing voice connection...`);
            voiceConnection.destroy();
            voiceConnection = null;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true
        });

        voiceConnection = connection;
        console.log(`✅ Successfully started voice connection attempt to: ${channel.name}`);

        // Enhanced error handling and state monitoring
        connection.on('error', (err) => {
            console.error('❌ Voice connection error:', err?.message || err);
            console.error('❌ Error details:', err);
        });

        connection.on('stateChange', (oldState, newState) => {
            // فقط لاگ برای تغییرات مهم یا وضعیت نهایی (connected)
            if (newState.status !== 'connecting' || oldState.status === 'disconnected' || oldState.status === 'signalling') {
                            }
            
            if (newState.status === 'disconnected') {
                console.log('⚠️ Voice connection disconnected, attempting to reconnect in 5s...');
                voiceConnection = null;
                setTimeout(() => { 
                    console.log('🔄 Attempting reconnection...');
                    connectToVoiceChannel(); 
                }, 5000);
            } else if (newState.status === 'connected') {
                console.log('✅ Voice connection established successfully');
            }
            // حذف لاگ مکرر "Voice connection in progress..." 
            // else if (newState.status === 'connecting') {
            //     console.log('🔄 Voice connection in progress...'); 
            // }
        });

        // حذف لاگ های دیباگ زیاد
        // connection.on('debug', (message) => {
        //     console.log(`🔍 Voice debug: ${message}`);
        // });

    } catch (error) {
        console.error('❌ Failed to connect to voice channel:', error?.message || error);
        console.error('❌ Full error:', error);
        voiceConnection = null;
    }
}

// When the client is ready, run this code (only once)
client.once('clientReady', async () => {
	console.log(`✅ Bot started successfully. ${client.user.tag}`);
// remove site link from startup logs per request
    console.log(`🔗 Bot Dakhel ${client.guilds.cache.size} server Hozor Darad`);
    
    // Initial update + schedule periodic refresh for online member count (every 5 minutes, no logs)
    setTimeout(() => { updateOnlineMemberCountChannel().catch(() => {}); }, 2000);
    setInterval(() => { updateOnlineMemberCountChannel().catch(() => {}); }, 5 * 60 * 1000);
    
    // Reset daily stats at midnight (Tehran Time)
    // 1. دریافت زمان فعلی تهران (به شکل یک شیء Date)
    const nowTehran = new Date(new Date().toLocaleString('en-US', { timeZone: TEHRAN_TIMEZONE }));

    // 2. محاسبه زمان نیمه‌شب فردا به وقت تهران
    const midnightTomorrowTehran = new Date(nowTehran);
    midnightTomorrowTehran.setDate(nowTehran.getDate() + 1);
    midnightTomorrowTehran.setHours(0, 0, 0, 0); // تنظیم به 00:00 فردا

    // 3. محاسبه اختلاف میلی‌ثانیه تا نیمه‌شب فردا
    let msUntilMidnight = midnightTomorrowTehran.getTime() - nowTehran.getTime();
    
    // بررسی خطا (اگر اختلاف منفی بود، یعنی از نیمه‌شب گذشته و باید 24 ساعت اضافه کنیم)
    if (msUntilMidnight < 0) {
        msUntilMidnight += 24 * 60 * 60 * 1000;
    }
    
    setTimeout(() => { // ✅ تغییر ۲: بازنشانی آمار به وقت تهران
        client.dailyStats = { commands: 0, messages: 0, joins: 0, leaves: 0 };
        console.log('📊 Daily statistics reset (Tehran Time)');
        
        // Schedule next reset for 24 hours later
        setInterval(() => {
            client.dailyStats = { commands: 0, messages: 0, joins: 0, leaves: 0 };
            console.log('📊 Daily statistics reset (Tehran Time)');
        }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    

    setTimeout(() => { connectToVoiceChannel(); }, 3000);
    
    updateBotActivity();
    // Update activity every 15 minutes to refresh the member count
    setInterval(() => {
        updateBotActivity().catch(() => {});
    }, 900000);
    
    updateSolarDateChannel();
    setInterval(() => {
        updateSolarDateChannel().catch(() => {});
    }, 60 * 60 * 1000);
    // --- END: Setting Bot Activity (Watching Status) ---

    // Reaction-role disabled per new requirement; using auto-role on member join instead

    // Register slash commands
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN || config.botToken);
        const commandsData = commandList.map(command => command.data.toJSON());
        
        // Get main guild ID
        const mainGuildId = process.env.GUILD_ID || config.discord.guildId;
        
        // First, delete all global commands to avoid duplicates
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: [] }
            );
            console.log('✅ Previous global commands deleted');
        } catch (deleteError) {
            console.log('ℹ️ Error deleting global commands (may not exist):', deleteError?.message || deleteError);
        }
        
        // Register commands for main guild (instant availability)
        // Only register guild-specific to avoid duplicate commands
        if (mainGuildId && mainGuildId !== 'your_discord_guild_id_here') {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, mainGuildId),
                    { body: commandsData }
                );
                console.log(`✅ ${commandsData.length} commands registered for main guild (instant availability)`);
            } catch (guildError) {
                console.error('⚠️ Error registering commands for main guild:', guildError?.message || guildError);
                // Fallback to global registration if guild registration fails
                try {
                    await rest.put(
                        Routes.applicationCommands(client.user.id),
                        { body: commandsData }
                    );
                    console.log(`✅ ${commandsData.length} commands registered globally (fallback)`);
                } catch (globalError) {
                    console.error('⚠️ Error registering global commands:', globalError?.message || globalError);
                }
            }
        } else {
            // If no guild ID, register globally
            try {
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commandsData }
                );
                console.log(`✅ ${commandsData.length} commands registered globally`);
            } catch (globalError) {
                console.error('⚠️ Error registering global commands:', globalError?.message || globalError);
            }
        }
        
		console.log(`✅ ${commandsData.length} commands ready to use.`);
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
    
    console.log('🎉 Bot initialization completed successfully!');
    
    // (legacy join removed; using connectToVoiceChannel above)
});

// Backfill helper: assign role to users who already reacted on a message
async function backfillReactionRole(guildId, channelId, messageId, emojiKey, roleId) {
    try {
        // Validate guild presence
        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        // Ensure bot has required perms
        const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
        if (!me || !me.permissions.has('ManageRoles')) return;

        // Fetch target message
        const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);
        if (!channel || !channel.messages) return;
        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (!message) return;

        // Find the reaction object for the emoji
        const reaction = message.reactions.cache.find(r => (r.emoji.id ? r.emoji.id : r.emoji.name) === emojiKey);
        if (!reaction) return;

        // Fetch users who reacted
        // Note: fetch() paginates under the hood
        const users = await reaction.users.fetch({ limit: 100 });
        for (const [, user] of users) {
            if (user.bot) continue;
            try {
                const member = await guild.members.fetch(user.id);
                if (!member.roles.cache.has(roleId)) {
                    await member.roles.add(roleId, 'Startup reaction-role backfill for ✅');
                }
            } catch (_) {}
        }
    } catch (error) {
        console.error('❌ Error during reaction-role backfill:', error);
    }
}

// Handle slash commands and button interactions
client.on('interactionCreate', async (interaction) => {
    // مدیریت دکمه‌ها و منوهای تیکت
    if (interaction.isButton()) {
        const buttonIds = ['create_ticket', 'create_ticket_complaint', 'create_ticket_suggestion', 'create_ticket_collaboration', 'close_ticket', 'reopen_ticket', 'delete_ticket', 'delete_ticket_with_transcript', 'delete_ticket_without_transcript', 'cancel_delete_ticket'];
        if (buttonIds.includes(interaction.customId)) {
            await ticketManager.handleButtonInteraction(interaction);
            return;
        }
    }

    // Handle select (drop-down) interactions for ticket panel
    if (interaction.isStringSelectMenu && interaction.isStringSelectMenu()) {
        if (interaction.customId === 'ticket_select') {
            await ticketManager.handleSelectInteraction(interaction);
            return;
        }
    }

    if (!interaction.isChatInputCommand()) return;

    // Dedup: ignore if we already handled this interaction id
    if (client.handledInteractions.has(interaction.id)) return;
    client.handledInteractions.add(interaction.id);
    setTimeout(() => client.handledInteractions.delete(interaction.id), 5 * 60 * 1000);

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // Track command usage
        const currentCount = client.commandUsage.get(interaction.commandName) || 0;
        client.commandUsage.set(interaction.commandName, currentCount + 1);
        client.dailyStats.commands++;
        
        await command.execute(interaction);
        // لاگ برای دستور fortest انجام نشود
        if (interaction.commandName !== 'fortest') {
            console.log(`✅ Dastor ${interaction.commandName} Estefade Shod Tavasot ${interaction.user.tag}`);
        }
    } catch (error) {
        // لاگ خطا برای دستور fortest انجام نشود
        if (interaction.commandName !== 'fortest') {
            console.error(`❌ Error executing command ${interaction.commandName}:`, error);
        }
        
        const errorMessage = {
            content: '❌ خطا در اجرای دستور!',
            flags: MessageFlags.Ephemeral
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Reaction add handler for reaction roles
client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (user.bot) return;

        // Ensure partials are resolved
        if (reaction.partial) {
            try { await reaction.fetch(); } catch { return; }
        }
        const message = reaction.message;
        const guild = message.guild;
        if (!guild) return;

        const mapping = client.reactionRoles.get(message.id);
        if (!mapping) return;

        // Normalize emoji key
        const emoji = reaction.emoji;
        const emojiKey = emoji.id ? emoji.id : emoji.name;
        const roleId = mapping[emojiKey];
        if (!roleId) return;

        try {
            const member = await guild.members.fetch(user.id);
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId, 'Reaction role assignment');
            }
        } catch (e) {
            // ignore per-user failures
        }
    } catch (error) {
        console.error('❌ Error in messageReactionAdd handler:', error);
    }
});

// Reaction remove handler to remove roles upon unreact
client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (user.bot) return;

        if (reaction.partial) {
            try { await reaction.fetch(); } catch { return; }
        }
        const message = reaction.message;
        const guild = message.guild;
        if (!guild) return;

        const mapping = client.reactionRoles.get(message.id);
        if (!mapping) return;

        const emoji = reaction.emoji;
        const emojiKey = emoji.id ? emoji.id : emoji.name;
        const roleId = mapping[emojiKey];
        if (!roleId) return;

        try {
            const member = await guild.members.fetch(user.id);
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId, 'Reaction role removed on unreact');
            }
        } catch (e) {
            // ignore per-user failures
        }
    } catch (error) {
        console.error('❌ Error in messageReactionRemove handler:', error);
    }
});


// Auto-react on new messages in configured channels
client.on('messageCreate', async (message) => {
    try {
        if (message.author?.bot) return;
        
        // Track message count
        client.dailyStats.messages++;
        
        // Handle prefix command: ;spam balasari (message text) (number)
        if (message.content.startsWith(';spam balasari')) {
            try {
                const content = message.content.trim();
                // Parse: ;spam balasari (message text) (number)
                // Extract message text and number
                const parts = content.replace(';spam balasari', '').trim();
                
                // Find the last number in the string (the count)
                const numberMatch = parts.match(/(\d+)\s*$/);
                if (!numberMatch) {
                    await message.reply('❌ فرمت دستور اشتباه است. استفاده: `;spam balasari (متن پیام) (تعداد)`');
                    return;
                }
                
                const count = parseInt(numberMatch[1], 10);
                if (count <= 0 || count > 50) {
                    await message.reply('❌ تعداد باید بین 1 تا 50 باشد.');
                    return;
                }
                
                // Extract message text (everything before the last number)
                const messageText = parts.substring(0, numberMatch.index).trim();
                if (!messageText) {
                    await message.reply('❌ متن پیام نمی‌تواند خالی باشد.');
                    return;
                }
                
                // Check if protected user is mentioned in the message
                const protectedUserId = '995631414907244646';
                const mentionsProtectedUser = message.mentions.users.has(protectedUserId) || 
                                            messageText.includes(`<@${protectedUserId}>`) || 
                                            messageText.includes(`<@!${protectedUserId}>`);
                
                if (mentionsProtectedUser) {
                    // Delete the user's command message
                    await message.delete().catch(() => {});
                    
                    // Send error message
                    const errorMsg = await message.channel.send('❌ این کاربر جزو کاربرهای حساس هست و تگ کردن آن ممنوع می‌باشد.').catch(() => null);
                    
                    // Delete both messages after 10 seconds
                    setTimeout(async () => {
                        try {
                            if (errorMsg) await errorMsg.delete();
                        } catch {}
                    }, 10000);
                    
                    return;
                }
                
                // Target channel ID
                const targetChannelId = '1428110246337056778';
                const targetChannel = await client.channels.fetch(targetChannelId).catch(() => null);
                
                if (!targetChannel) {
                    await message.reply('❌ چنل مورد نظر یافت نشد.');
                    return;
                }
                
                // Check if bot can send messages to the target channel
                const botMember = targetChannel.guild?.members?.me;
                if (botMember) {
                    const permissions = targetChannel.permissionsFor(botMember);
                    if (!permissions || !permissions.has('SendMessages')) {
                        await message.reply('❌ ربات دسترسی ارسال پیام به این چنل را ندارد.');
                        return;
                    }
                }
                
                // Delete the original command message
                await message.delete().catch(() => {});
                
                // Send confirmation
                const confirmMsg = await message.channel.send(`✅ در حال ارسال ${count} پیام به چنل <#${targetChannelId}>...`).catch(() => null);
                
                // Send messages with delay to avoid rate limits (100ms between each)
                let successCount = 0;
                for (let i = 0; i < count; i++) {
                    try {
                        await targetChannel.send(messageText);
                        successCount++;
                        // Delay between messages (100ms)
                        if (i < count - 1) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    } catch (error) {
                        console.error(`❌ Error sending spam message ${i + 1}:`, error);
                    }
                }
                
                // Update confirmation message
                if (confirmMsg) {
                    await confirmMsg.edit(`✅ ${successCount} از ${count} پیام با موفقیت ارسال شد به چنل <#${targetChannelId}>`).catch(() => {});
                    // Delete confirmation after 5 seconds
                    setTimeout(async () => {
                        try {
                            await confirmMsg.delete();
                        } catch {}
                    }, 5000);
                }
                
                return; // Don't process further
            } catch (error) {
                console.error('❌ Error in spam balasari command:', error);
                await message.reply('❌ خطا در اجرای دستور.').catch(() => {});
                return;
            }
        }
        
        // بررسی تگ کردن کاربر محافظت شده در چنل‌های مشخص شده
        const protectedUserId = '995631414907244646';
        const restrictedChannels = ['1401868465954099271', '1430208119891427368', '1428110246337056778'];
        
        if (restrictedChannels.includes(message.channelId)) {
            // بررسی اینکه آیا پیام شامل تگ کاربر محافظت شده است
            const mentionsUser = message.mentions.users.has(protectedUserId) || 
                                message.content.includes(`<@${protectedUserId}>`) || 
                                message.content.includes(`<@!${protectedUserId}>`);
            
            if (mentionsUser) {
                try {
                    // حذف پیام
                    await message.delete();
                    
                    // ارسال پیام هشدار موقت در چنل (فقط برای چند ثانیه نمایش داده می‌شود)
                    const warningMessage = await message.channel.send({
                        content: `${message.author} این شخص رو تگ نکن اینجا پسر خوب 😡🤣`
                    });
                    
                    // حذف پیام هشدار بعد از 3 ثانیه (فقط کاربر فرصت دیدن دارد)
                    setTimeout(async () => {
                        try {
                            await warningMessage.delete();
                        } catch (e) {
                            // ignore
                        }
                    }, 3000);
                    
                    return; // از ادامه پردازش جلوگیری می‌کند
                } catch (error) {
                    console.error('❌ Error handling protected user mention:', error);
                }
            }
        }
        
        // Anti-spam processing
        if (!antiSpam.isExempt(message)) {
            const entries = antiSpam.pushMessage(message);
            const score = antiSpam.computeViolations(message, entries);
            if (score > 0) {
                await antiSpam.applyPunishment(message, score);
            }
        }
        
        // Auto-react with specific emojis for specific channels
        const channelEmojiMap = {
            '1431664611761061961': '🚫', // :no_entry_sign:
            '1430208119891427368': '⛔', // :no_entry:
            '1401868465954099271': '👁️', // :eye:
            '1428110246337056778': '👨‍👩‍👧‍👦' // :family:
        };
        
        const emojiForChannel = channelEmojiMap[message.channelId];
        if (emojiForChannel) {
            try {
                await message.react(emojiForChannel);
            } catch (reactError) {
                console.error(`❌ Error reacting to message in channel ${message.channelId}:`, reactError);
            }
        }
        
        const set = client.autoReactions.get(message.channelId);
        if (!set || set.size === 0) return;
        for (const emojiKey of set) {
            try { await message.react(emojiKey); } catch {}
        }
    } catch (error) {
        console.error('❌ Error in messageCreate auto-reaction:', error);
    }
});



// Ensure single-message auto reactions persist if removed
client.on('messageReactionRemove', async (reaction, user) => {
    try {
        // Re-apply auto reactions configured for a single message
        if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
        const message = reaction.message;
        const set = client.autoReactSingle.get(message.id);
        if (!set || set.size === 0) return;
        const emojiKey = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
        if (set.has(emojiKey)) {
            try { await message.react(emojiKey); } catch {}
        }
    } catch (error) {
        // silent
    }
});

// Voice state update handler
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const voiceChannelId = '1400945138171248812'; // ویس چنل مورد نظر
        const targetUserId = '995631414907244646'; // کاربری که باید پیام بگیره

        // Allow logging for bots too (no early return)
        

        // Check if someone joined the specific voice channel
        if (!newState.member?.user?.bot && newState.channelId === voiceChannelId && oldState.channelId !== voiceChannelId) {
            console.log(`✅ ${newState.member.user.username} joined voice move me `);
            
            try {
                // Send message to the person who joined
                const welcomeMessage = `درود ${newState.member}\n` +
                                     `به زودی به درخواست شما رسیدگی خواهد شد .\n` +
                                     `ممنون از صبوری شما 🌹\n` +
                                     `**زمان:** <t:${Math.floor(Date.now() / 1000)}:F>`;
                
                await newState.member.send(welcomeMessage);
                console.log(`📩 wait message sent to ${newState.member.user.username} `);
                
            } catch (dmError) {
                console.error(`❌ Error sending welcome DM to ${newState.member.user.tag}:`, dmError);
            }
            
            try {
                // Send notification to all users with full permissions plus specific roles
                const guild = newState.guild;
                const specificRoleIds = ['1415440089047371897', '1400910230358851686', '1400919880017907797'];
                
                // Get all members with Administrator permission
                const adminMembers = guild.members.cache.filter(member => 
                    member.permissions.has('Administrator') && !member.user.bot
                );
                
                // Get all members with specific roles
                const roleMembers = guild.members.cache.filter(member => 
                    member.roles.cache.some(role => specificRoleIds.includes(role.id)) && !member.user.bot
                );
                
                // Combine and deduplicate members
                const allTargetMembers = new Set([...adminMembers.values(), ...roleMembers.values()]);
                
                const notificationMessage = `یک درخواست از این چنل داری : <#${newState.channel.id}>\n` +
                                          `**کاربر:** <@${newState.member.user.id}>\n` +
                                          `زمان : <t:${Math.floor(Date.now() / 1000)}:F>`;
                
                let successCount = 0;
                let failCount = 0;
                
                // Send DM to all target members
                for (const member of allTargetMembers) {
                    try {
                        await member.send(notificationMessage);
                        successCount++;
                        console.log(`📩 Notification sent to ${member.user.tag}`);
                    } catch (dmError) {
                        failCount++;
                        console.log(`❌ Failed to send DM to ${member.user.tag}: ${dmError.message}`);
                    }
                }
                
                console.log(`🔔 Notifications sent: ${successCount} success, ${failCount} failed`);
                
            } catch (error) {
                console.error(`❌ Error sending notifications:`, error);
            }
        }
        
        // Check if someone left the voice channel
        if (!oldState.member?.user?.bot && oldState.channelId === voiceChannelId && newState.channelId !== voiceChannelId) {
            console.log(`🎤 ${oldState.member.user.tag} left target voice channel`);
        }
        
        // If the bot itself left a voice channel, try to reconnect to the target voice by ID
        if (oldState.member?.id === client.user.id && oldState.channelId && !newState.channelId) {
            setTimeout(() => { connectToVoiceChannel(); }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error in voice state update:', error);
    }
});

// Presence updates removed - online count updates every 5 minutes via setInterval only



// Listen for new members joining the server
client.on('guildMemberAdd', async (member) => {
    try {
        // Ignore bot accounts for DM welcome and nickname change; only post in channel
        const isBotAccount = member.user?.bot === true;

        // Dedup: ensure we welcome only once per member
        if (client.handledGuildMemberAdds.has(member.id)) {
            return;
        }
        client.handledGuildMemberAdds.add(member.id);
        // Auto-expire after 10 minutes (safety)
        setTimeout(() => client.handledGuildMemberAdds.delete(member.id), 10 * 60 * 1000);

        console.log(`👋 New member joined: ${member.user.tag} (${member.user.id})`);
        
        // Track join count
        client.dailyStats.joins++;
        
        if (isBotAccount) {
            try { await member.setNickname('𝐂𝐋𝐔𝐁 𝐁𝐎𝐓', 'Rename bot on join as requested'); } catch (_) {}
        } else {
            // Prefix member nickname with '! ' keeping existing display name
            try {
                const baseName = member.displayName || member.user.username;
                const prefixed = baseName.startsWith('! ') ? baseName : `! ${baseName}`;
                if (prefixed !== member.displayName) {
                    await member.setNickname(prefixed, 'Prefix name with ! on join');
                }
            } catch (_) {}
        }
        

        // Update online member count as new member might be online
        updateOnlineMemberCountChannel();
        
        // --- START: Update Activity on Join ---
        updateBotActivity(); 
        // --- END: Update Activity on Join ---

        // Send welcome message to welcome channel for all joins
        await sendWelcomeChannelMessage(member);
        
        // Send welcome DM to users only (not bots)
        if (!isBotAccount) {
            await sendWelcomeDM(member);
        }
        
    } catch (error) {
        console.error('❌ Error handling new member:', error);
    }
});


// Also update counter when a member leaves
client.on('guildMemberRemove', async (member) => {
    try {
        console.log(`👋 Member left: ${member.user?.tag || member.id}`);
        
        // Track leave count
        client.dailyStats.leaves++;
        
        // Note: We can't restore nickname here because the member is no longer in the server
        // The nickname will be automatically reset when they rejoin
        
        // Update online member count as member left (might have been online)
        updateOnlineMemberCountChannel();
        
        // --- START: Update Activity on Leave ---
        updateBotActivity(); 
        // --- END: Update Activity on Leave ---
        
    } catch (error) {
        // silent
    }
});




// Function to send welcome message to the welcome channel
async function sendWelcomeChannelMessage(member) {
    try {
        const welcomeChannel = client.channels.cache.get(config.welcomeChannelId);
        
        if (!welcomeChannel) {
            console.error(`❌ Welcome channel not found with ID: ${config.welcomeChannelId}`);
            return;
        }

		const welcomeMessage = `𝐃𝐨𝐫𝐨𝐝 ${member} 𝐊𝐡𝐨𝐬𝐡 𝐎𝐦𝐚𝐝𝐲 𝐁𝐞 𝐂𝐋𝐔𝐁𝐒`;
		const channelIconUrl = welcomeChannel.guild.iconURL({ size: 512 });
		const embed = new EmbedBuilder()
			.setColor(0x000000) // ✅ تغییر ۳: رنگ امبد به مشکی (0x000000)
			.setAuthor({ name: member.user.tag, iconURL: channelIconUrl })
			.setImage(channelIconUrl);

		// Add link button to join team channel
		const guildId = welcomeChannel.guild.id;
		const targetChannelId = '1432696565247512618';
		const linkUrl = `https://discord.com/channels/${guildId}/${targetChannelId}`;
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel('برای عضویت در تیم کلاب کلیک کنید ')
				.setURL(linkUrl)
		);

		await welcomeChannel.send({ content: welcomeMessage, embeds: [embed], components: [row] });
		console.log(`✅ Welcome message (with avatar) sent to channel for ${member.user.tag}`);
        
    } catch (error) {
        console.error('❌ Error sending welcome channel message:', error);
    }
}

// Function to send DM to new member
async function sendWelcomeDM(member) {
    try {
		const dmMessage = `𝐃𝐨𝐫𝐨𝐝 𝐊𝐡𝐨𝐬h 𝐎𝐦𝐚𝐝𝐲 𝐁𝐞 𝐂𝐋𝐔𝐁𝐒🌹 ${member}`
        const guildId = member.guild.id;
        const targetChannelId = '1432696565247512618';
        const linkUrl = `https://discord.com/channels/${guildId}/${targetChannelId}`;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('برای عضویت در تیم CLB کلیک کنید')
                .setURL(linkUrl)
        );

        await member.send({ content: dmMessage, components: [row] });
        console.log(`✅ Welcome DM sent to ${member.user.tag}`);
        
    } catch (error) {
        console.error('❌ Error sending welcome DM:', error);
        // If DM fails, try to send a message in a general channel as fallback
        try {
            const generalChannel = member.guild.channels.cache.find(channel => 
                channel.type === 0 && channel.permissionsFor(member.guild.members.me).has('SendMessages')
            );
            
            if (generalChannel) {
                await generalChannel.send(`خوش اومدی ${member}! لطفاً پیام خصوصی خود را برای اطلاعات بیشتر بررسی کنید.`);
                console.log(`✅ Fallback welcome message sent to ${generalChannel.name} for ${member.user.tag}`);
            }
        } catch (fallbackError) {
            console.error('❌ Error sending fallback welcome message:', fallbackError);
        }
    }
}

// Handle errors with better error handling
client.on('error', error => {
    console.error('❌ Discord client error:', error);
    // Don't crash the bot on client errors
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled promise rejection at:', promise, 'reason:', reason);
    // Don't crash the process on unhandled rejections
});

process.on('uncaughtException', (error) => {
    try {
        console.error('❌ Uncaught Exception:', error);
        const msg = (error && (error.message || '')).toString();
        // Handle known missing-DAVE error from @discordjs/voice gracefully so the bot doesn't exit
        if (msg.includes('DAVE') || msg.includes('@snazzah/davey') || msg.includes('Cannot utilize the DAVE protocol')) {
            console.error('⚠️ Detected missing DAVE dependency required by @discordjs/voice.');
            console.error('👉 Install it with: npm install @snazzah/davey --save');
            // Avoid exiting; allow process to keep running and attempt reconnection if appropriate.
            return;
        }
    } catch (innerErr) {
        console.error('❌ Error while processing uncaughtException handler:', innerErr);
    }
    // For other errors, perform default shutdown to avoid unknown corrupted state.
    try {
        console.error('❌ Fatal error, exiting process to avoid inconsistent state.');
    } catch (_) {}
    process.exit(1);
});

// Login to Discord with your client's token
const botToken = process.env.DISCORD_BOT_TOKEN || config.discord.botToken;
// Validate token presence/format before attempting login
if (!botToken || botToken === 'your_discord_bot_token_here') {
    console.error('❌ Bot token not found! Please set DISCORD_BOT_TOKEN in your .env file');
    console.error('📝 You can run: npm run setup:env');
    process.exit(1);
}
if (typeof botToken !== 'string' || botToken.split('.').length !== 3 || /\s/.test(botToken)) {
    console.error('❌ Bot token format looks invalid. Ensure it is the exact Bot Token (3 parts, no spaces).');
    process.exit(1);
}

console.log('🔑 Bot token loaded successfully');
client.login(botToken);