const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

// تنظیمات تیکت
const TICKET_CONFIG = {
    openCategoryId: '1430265943879057408',    // کتگوری تیکت‌های باز
    closeCategoryId: '1430265894839259136',   // کتگوری تیکت‌های بسته
    transcriptChannelId: '1430265420035784775', // چنل ارسال ترنسکریپت
    // رول‌هایی که به همه تیکت‌ها دسترسی دارند
    allowedRoles: [
        '1432688893106458705' // دسترسی کامل به همه تیکت‌ها
    ],
    // دسترسی مخصوص برای برخی انواع تیکت
    typeRoleAccess: {
        server_complaint: ['1415440089047371897'], // رول فقط برای شکایت
        vip_request: ['1415440089047371897'],      // رول فقط برای VIP
        suggestions: ['1415440089047371897']       // رول فقط برای انتقادات/پیشنهادات
    },
    ticketTypes: {
        server_complaint: { name: 'شکایت از سرور', emoji: '🚨', prefix: 'complaint' },
        membership: { name: 'درخواست عضویت', emoji: '🟢', prefix: 'membership' },
        suggestions: { name: 'انتقادات و پیشنهادات', emoji: '💡', prefix: 'suggestion' },
        collaboration: { name: 'همکاری', emoji: '🤝', prefix: 'collaboration' },
        ban_review: { name: 'بررسی بن', emoji: '🛡️', prefix: 'banreview' },
        vip_request: { name: 'درخواست VIP', emoji: '💎', prefix: 'vip' }
    }
};

// ذخیره اطلاعات تیکت‌ها در حافظه
const activeTickets = new Map(); // channelId => { userId, createdAt, ticketNumber }
const fs = require('fs');
const path = require('path');

// Simple file-based ticket counter persistence
const COUNTER_FILE = path.join(__dirname, 'ticket-counter.json');

function loadTicketCounter() {
    try {
        if (fs.existsSync(COUNTER_FILE)) {
            const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
            return data.counter || 1;
        }
    } catch (error) {
        console.error('Error loading ticket counter:', error);
    }
    return 1;
}

function saveTicketCounter(counter) {
    try {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ counter }, null, 2));
    } catch (error) {
        console.error('Error saving ticket counter:', error);
    }
}

let ticketCounter = loadTicketCounter();

// کلاس مدیریت تیکت
class TicketManager {
    constructor(client) {
        this.client = client;
    }

    // ارسال لاگ اکشن تیکت
    async sendTicketActionLog({ guild, actorUser, ticketNumber, action }) {
        try {
            const LOG_CHANNEL_ID = '1430267793793880247';
            const channel = await this.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (!channel || !channel.send) return;

            const actor = actorUser || this.client.user;
            // تعیین رنگ بر اساس نوع اکشن
            let embedColor = 0x000000; // مشکی برای سایر اکشن‌ها
            if (action === 'Created') {
                embedColor = 0x00ff00; // سبز برای ایجاد تیکت
            } else if (action === 'Deleted') {
                embedColor = 0xff0000; // قرمز برای حذف تیکت
            }
            
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ name: actor.tag, iconURL: actor.displayAvatarURL?.({ size: 128 }) })
                .addFields(
                    { name: 'Logged Info', value: `Ticket: Ticket-${String(ticketNumber).padStart(4, '0')}\nAction: ${action}`, inline: true },
                    { name: 'Panel', value: 'CLUBS-Ticket 2', inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (_) {}
    }

    // ایجاد تیکت جدید
    async createTicket(interaction, ticketType = 'server_complaint') {
        try {
            const guild = interaction.guild;
            const user = interaction.user;
            
            // بررسی اینکه کاربر قبلاً تیکت باز دارد یا نه
            const existingTicket = Array.from(activeTickets.values()).find(ticket => ticket.userId === user.id);
            if (existingTicket) {
                const existingChannel = guild.channels.cache.get(existingTicket.channelId);
                if (existingChannel) {
                return await interaction.reply({
                    content: `❌ شما قبلاً یک تیکت باز دارید: ${existingChannel}`,
                    flags: MessageFlags.Ephemeral
                });
                } else {
                    // اگر چنل موجود نیست، آن را از لیست حذف کن
                    activeTickets.delete(existingTicket.channelId);
                }
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // دریافت اطلاعات نوع تیکت
            const typeInfo = TICKET_CONFIG.ticketTypes[ticketType] || TICKET_CONFIG.ticketTypes['server_complaint'];
            
            // ایجاد چنل تیکت با فرمت جدید: تیکت-شماره-موضوع-نام کاربر
            const ticketChannel = await guild.channels.create({
                name: `ticket-${String(ticketCounter).padStart(4, '0')}-${typeInfo.prefix}-${user.username}`,
                type: ChannelType.GuildText,
                parent: TICKET_CONFIG.openCategoryId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    },
                    {
                        id: this.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // اضافه کردن دسترسی برای رول‌های عمومی همه تیکت‌ها
            for (const roleId of TICKET_CONFIG.allowedRoles) {
                await ticketChannel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                    ManageMessages: true  // برای بستن تیکت
                    // بدون ManageChannels - نمی‌توانند تیکت را حذف کنند
                });
            }

            // صراحتاً عدم دسترسی برای این دو رول
            const denyRoles = ['1400919880017907797', '1400910230358851686'];
            for (const roleId of denyRoles) {
                await ticketChannel.permissionOverwrites.create(roleId, {
                    ViewChannel: false,
                    SendMessages: false,
                    ReadMessageHistory: false,
                    AttachFiles: false,
                    EmbedLinks: false
                });
            }

            // اضافه کردن دسترسی مخصوص برای نوع تیکت جاری (در صورت تعریف)
            const typeSpecificRoles = (TICKET_CONFIG.typeRoleAccess && TICKET_CONFIG.typeRoleAccess[ticketType]) || [];
            for (const roleId of typeSpecificRoles) {
                await ticketChannel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                    ManageMessages: true
                });
            }

            // ذخیره اطلاعات تیکت (حافظه)
            const createdAt = Date.now();
            const info = { userId: user.id, createdAt, ticketNumber: ticketCounter, channelId: ticketChannel.id, ticketType };
            activeTickets.set(ticketChannel.id, info);

            ticketCounter++;
            saveTicketCounter(ticketCounter);

            // ایجاد embed پیام خوشامد
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x000000) // تغییر رنگ به مشکی
                .setTitle(`${typeInfo.emoji} تیکت ${typeInfo.name} ایجاد شد`)
                .setDescription(`سلام ${user}!\n\nتیکت ${typeInfo.name} شما با موفقیت ایجاد شد. لطفاً ${typeInfo.name === 'شکایت از سرور' ? 'مشکل خود را' : typeInfo.name === 'انتقادات و پیشنهادات' ? 'انتقاد یا پیشنهاد خود را' : 'درخواست همکاری خود را'} به صورت کامل توضیح دهید.\n\nتیم پشتیبانی به زودی پاسخ شما را خواهد داد.`)
                .addFields([
                    { name: '👤 کاربر', value: user.toString(), inline: true },
                    { name: '🕒 زمان ایجاد', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🔢 شماره تیکت', value: `#${String(ticketCounter - 1).padStart(4, '0')}`, inline: true },
                    { name: '📋 نوع تیکت', value: typeInfo.name, inline: true }
                ])
                .setFooter({ text: 'برای بستن تیکت، روی دکمه زیر کلیک کنید' })
                .setTimestamp();

            // دکمه بستن تیکت
            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('🔒 بستن تیکت')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            // ارسال پیام خوشامد در تیکت
            await ticketChannel.send({
                content: `${user} - تیکت شما ایجاد شد! `,
                embeds: [welcomeEmbed],
                components: [row],
                allowedMentions: { roles: ['1432688893106458705'], users: [user.id] }
            });

            // Restrict visibility strictly to opener + allowed roles
            try {
                // ابتدا همه را ببند
                await ticketChannel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
                // سپس دسترسی رول‌های عمومی و رول‌های نوع تیکت را که قبل‌تر اضافه کردیم حفظ می‌شود
            } catch (_) {}

            // Notify ticket manager role explicitly
            try {
                await ticketChannel.send({
                    content: `<@&1432688893106458705> رسیدگی این تیکت با شما `,
                    allowedMentions: { roles: ['1432688893106458705'] }
                });
            } catch (_) {}

            // ارسال لاگ ایجاد تیکت
            await this.sendTicketActionLog({
                guild,
                actorUser: user,
                ticketNumber: ticketCounter - 1,
                action: 'Created'
            });

            // پاسخ به کاربر
            await interaction.editReply({
                content: `✅ تیکت شما با موفقیت ایجاد شد: ${ticketChannel}`
            });

            console.log(`✅ New ticket created: ${ticketChannel.name} by ${user.tag}`);

        } catch (error) {
            console.error('❌ Error creating ticket:', error);
            await interaction.editReply({
                content: '❌ خطا در ایجاد تیکت! لطفاً دوباره تلاش کنید.'
            });
        }
    }

    // بستن تیکت
    async closeTicket(interaction) {
        try {
            // فقط این دو رول بتوانند ببندند (ادمین عمومی یا ManageChannels کافی نیست)
            const member = interaction.member;
            const channel = interaction.channel;
            const closeAllowedRoles = new Set(['1432688893106458705','1415440089047371897']);
            const hasCloseRole = Array.from(member.roles.cache.keys()).some(id => closeAllowedRoles.has(id));

            if (!hasCloseRole) {
                return await interaction.reply({
                    content: '❌ شما نمیتوانید تیکت را ببندید.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // بررسی وجود چنل
            if (!channel || !channel.guild) {
                return await interaction.reply({
                    content: '❌ چنل مورد نظر یافت نشد!',
                    flags: MessageFlags.Ephemeral
                });
            }

            let ticketInfo = activeTickets.get(channel.id);

            // اگر در لیست فعال نیست، سعی کن از نام چنل اطلاعات را استخراج کنی
            if (!ticketInfo) {
                const channelName = channel.name;
                // فرمت جدید: تیکت-شماره-موضوع-نام کاربر
                let ticketMatch = channelName.match(/^ticket-(\d+)-(\w+)-(.+)$/);
                
                if (ticketMatch) {
                    const ticketNumber = parseInt(ticketMatch[1]);
                    const ticketType = ticketMatch[2];
                    const username = ticketMatch[3];
                    
                    // پیدا کردن آیدی کاربر از نام کاربری
                    let userId = null;
                    try {
                        const guild = interaction.guild;
                        const members = await guild.members.fetch();
                        const user = members.find(member => member.user.username === username)?.user;
                        userId = user?.id;
                    } catch (error) {
                        console.error('Error finding user by username:', error);
                    }
                    
                    // ایجاد ticketInfo موقت
                    ticketInfo = {
                        ticketNumber: ticketNumber,
                        userId: userId,
                        channelId: channel.id,
                        createdAt: Date.now(),
                        ticketType: ticketType
                    };
                } else {
                    // فرمت‌های قدیمی برای سازگاری
                    // قدیمی 1: آیدی-نوع
                    ticketMatch = channelName.match(/^(\d+)-(\w+)$/);
                    if (ticketMatch) {
                        const userId = ticketMatch[1];
                        const ticketType = ticketMatch[2];
                        ticketInfo = { ticketNumber: ticketCounter, userId, channelId: channel.id, createdAt: Date.now(), ticketType };
                    } else {
                        // قدیمی 2: شماره-نوع-آیدی
                        ticketMatch = channelName.match(/(\d+)-(\w+)-(\d+)/);
                        if (ticketMatch) {
                            const ticketNumber = parseInt(ticketMatch[1]);
                            const ticketType = ticketMatch[2];
                            const userId = ticketMatch[3];
                            ticketInfo = { ticketNumber, userId, channelId: channel.id, createdAt: Date.now(), ticketType };
                        } else {
                            // قدیمی 3: ticket-شماره-نام‌کاربری
                            ticketMatch = channelName.match(/ticket-(\d+)-(.+)/);
                            if (ticketMatch) {
                                const ticketNumber = parseInt(ticketMatch[1]);
                                const username = ticketMatch[2];
                                
                                // پیدا کردن کاربر اصلی
                                let originalUserId = null;
                                try {
                                    const guild = interaction.guild;
                                    const members = await guild.members.fetch();
                                    const originalUser = members.find(member => member.user.username === username)?.user;
                                    originalUserId = originalUser?.id;
                                } catch (error) {
                                    console.error('Error finding original user:', error);
                                }

                                ticketInfo = {
                                    ticketNumber: ticketNumber,
                                    userId: originalUserId,
                                    channelId: channel.id,
                                    createdAt: Date.now()
                                };
                            }
                        }
                    }
                }
            }

            if (!ticketInfo) {
                return await interaction.reply({
                    content: '❌ این چنل یک تیکت معتبر نیست!',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // انتقال تیکت به کتگوری بسته
            try {
                await channel.setParent(TICKET_CONFIG.closeCategoryId);
            } catch (error) {
                console.error('Error setting parent category:', error);
                // ادامه بدون تغییر کتگوری
            }
            
            // نام‌گذاری مجدد چنل با فرمت جدید
            try {
                if (ticketInfo.ticketType && ticketInfo.userId && ticketInfo.ticketNumber) {
                    const typeInfo = TICKET_CONFIG.ticketTypes[ticketInfo.ticketType] || TICKET_CONFIG.ticketTypes['server_complaint'];
                    // پیدا کردن نام کاربری از آیدی
                    let username = 'unknown';
                    try {
                        const user = await this.client.users.fetch(ticketInfo.userId);
                        username = user.username;
                    } catch (error) {
                        console.error('Error fetching user for username:', error);
                    }
                    await channel.setName(`closed-ticket-${String(ticketInfo.ticketNumber).padStart(4, '0')}-${typeInfo.prefix}-${username}`);
                } else {
                    // فرمت قدیمی برای سازگاری
                    await channel.setName(`closed-${channel.name}`);
                }
            } catch (error) {
                console.error('Error renaming channel:', error);
                // ادامه بدون تغییر نام
            }

            // حذف کامل دسترسی کاربر اصلی (انگار تیکت حذف شده)
            let originalUser = null;
            try {
                originalUser = await this.client.users.fetch(ticketInfo.userId);
            } catch (error) {
                console.error('Error fetching original user:', error);
            }
            
            if (originalUser) {
                try {
                    await channel.permissionOverwrites.edit(originalUser.id, {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                        AttachFiles: false,
                        EmbedLinks: false
                    });
                } catch (error) {
                    console.error('Error updating user permissions:', error);
                }
            }

            // پیام بستن تیکت
            const closeEmbed = new EmbedBuilder()
                .setColor(0x000000) // تغییر رنگ به مشکی
                .setTitle('🔒 تیکت بسته شد')
                .setDescription('این تیکت توسط عضو تیم پشتیبانی بسته شد.')
                .addFields([
                    { name: '👤 بسته شده توسط', value: interaction.user.toString(), inline: true },
                    { name: '🕒 زمان بسته شدن', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                ])
                .setTimestamp();

            // دکمه‌های مدیریت تیکت بسته
            const deleteButton = new ButtonBuilder()
                .setCustomId('delete_ticket')
                .setLabel('🗑️ حذف تیکت')
                .setStyle(ButtonStyle.Danger);

            const reopenButton = new ButtonBuilder()
                .setCustomId('reopen_ticket')
                .setLabel('🔓 باز کردن تیکت')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(reopenButton, deleteButton);

            await interaction.editReply({
                embeds: [closeEmbed],
                components: [row]
            });

            // ارسال اطلاع‌رسانی به کاربر اصلی
            if (originalUser) {
                try {
                    const userNotificationEmbed = new EmbedBuilder()
                        .setColor(0x000000) // تغییر رنگ به مشکی
                        .setTitle('🔒 تیکت شما بسته شد')
                        .setDescription(`تیکت #${String(ticketInfo.ticketNumber).padStart(4, '0')} شما توسط تیم پشتیبانی بسته شد.`)
                        .addFields([
                            { name: '🕒 زمان بسته شدن', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                            { name: '👤 بسته شده توسط', value: interaction.user.tag, inline: true }
                        ])
                        .setFooter({ text: 'CLUBS_ticket' })
                        .setTimestamp();

                    await originalUser.send({ embeds: [userNotificationEmbed] });
                    console.log(`📩 Closure notification sent to ${originalUser.tag}`);
                } catch (dmError) {
                    console.error('Error sending closure notification to user:', dmError);
                    // ادامه بدون ارسال DM
                }
            }

            // حذف از لیست تیکت‌های فعال
            activeTickets.delete(channel.id);

            console.log(`✅ Ticket closed: ${channel.name} by ${interaction.user.tag}`);

        } catch (error) {
            console.error('❌ Error closing ticket:', error);
            
            // بررسی نوع خطا و پاسخ مناسب
            let errorMessage = '❌ خطا در بستن تیکت!';
            if (error.code === 10003) {
                errorMessage = '❌ چنل مورد نظر یافت نشد! ممکن است قبلاً حذف شده باشد.';
            } else if (error.code === 50013) {
                errorMessage = '❌ دسترسی لازم برای این عملیات وجود ندارد!';
            }
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: errorMessage });
                } else {
                    await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
                }
            } catch (replyError) {
                console.error('Error sending error message:', replyError);
            }
        }
    }

    // باز کردن مجدد تیکت
    async reopenTicket(interaction) {
        try {
            // بررسی دسترسی: ادمین، رول مجاز یا کسانی که ManageChannels دارند
            const member = interaction.member;
            const channel = interaction.channel;
            const hasAdminPermission = member.permissions.has(PermissionFlagsBits.Administrator);
            const hasAllowedRole = TICKET_CONFIG.allowedRoles.some(roleId => member.roles.cache.has(roleId));
            const hasManageChannels = channel.permissionsFor(member)?.has(PermissionFlagsBits.ManageChannels);

            if (!hasAdminPermission && !hasAllowedRole && !hasManageChannels) {
                return await interaction.reply({
                    content: '❌ شما دسترسی لازم برای باز کردن تیکت را ندارید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            // بررسی اینکه در کتگوری بسته است
            if (channel.parentId !== TICKET_CONFIG.closeCategoryId) {
                return await interaction.reply({
                    content: '❌ فقط تیکت‌های بسته شده قابل باز کردن مجدد هستند!',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply();

            // استخراج اطلاعات از نام چنل
            const channelName = channel.name;
            // فرمت جدید: closed-ticket-شماره-موضوع-نام کاربر
            let ticketMatch = channelName.match(/^closed-ticket-(\d+)-(\w+)-(.+)$/);
            
            // اگر پیدا نشد، شاید فرمت قدیمی باشد
            if (!ticketMatch) {
                // قدیمی 1: closed-آیدی-نوع
                ticketMatch = channelName.match(/^closed-(\d+)-(\w+)$/);
                if (!ticketMatch) {
                    // قدیمی 2: closed-شماره-نوع-آیدی
                    ticketMatch = channelName.match(/closed-(\d+)-(\w+)-(\d+)/);
                    if (!ticketMatch) {
                        // قدیمی 3: closed-ticket-شماره-نام کاربر
                        ticketMatch = channelName.match(/closed-ticket-(\d+)-(.+)/);
                    }
                }
            }
            
            if (!ticketMatch) {
                return await interaction.editReply({
                    content: '❌ نام تیکت نامعتبر است! فرمت نام: ' + channelName
                });
            }

            let ticketNumber, ticketType, userId;
            
            if (ticketMatch && ticketMatch.length === 4) {
                // فرمت جدید: closed-ticket-شماره-موضوع-نام کاربر
                ticketNumber = parseInt(ticketMatch[1]);
                ticketType = ticketMatch[2];
                const username = ticketMatch[3];
                
                // پیدا کردن آیدی کاربر از نام کاربری
                try {
                    const guild = interaction.guild;
                    const members = await guild.members.fetch();
                    const user = members.find(member => member.user.username === username)?.user;
                    userId = user?.id;
                } catch (error) {
                    console.error('Error finding user by username:', error);
                }
            } else if (ticketMatch && ticketMatch.length === 3) {
                // قدیمی 1: closed-آیدی-نوع
                userId = ticketMatch[1];
                ticketType = ticketMatch[2];
                ticketNumber = ticketCounter; // شماره در نام نیست
            } else if (ticketMatch && ticketMatch.length === 4 && ticketMatch[0].includes('closed-')) {
                // قدیمی 2: closed-شماره-نوع-آیدی
                ticketNumber = parseInt(ticketMatch[1]);
                ticketType = ticketMatch[2];
                userId = ticketMatch[3];
            } else {
                // قدیمی 3: closed-ticket-شماره-نام کاربر
                ticketNumber = parseInt(ticketMatch[1]);
                const username = ticketMatch[2];
                
                // پیدا کردن کاربر اصلی
                try {
                    const guild = interaction.guild;
                    const members = await guild.members.fetch();
                    const originalUser = members.find(member => member.user.username === username)?.user;
                    userId = originalUser?.id;
                } catch (error) {
                    console.error('Error finding original user:', error);
                }
            }

            // پیدا کردن کاربر اصلی
            let originalUser = null;
            if (userId) {
                try {
                    originalUser = await this.client.users.fetch(userId);
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }

            // انتقال تیکت به کتگوری باز
            await channel.setParent(TICKET_CONFIG.openCategoryId);
            
            // نام‌گذاری مجدد چنل با فرمت جدید
            if (ticketType && ticketNumber && userId) {
                const typeInfo = TICKET_CONFIG.ticketTypes[ticketType] || TICKET_CONFIG.ticketTypes['server_complaint'];
                const username = originalUser?.username || 'unknown';
                await channel.setName(`ticket-${String(ticketNumber).padStart(4, '0')}-${typeInfo.prefix}-${username}`);
            } else {
                // فرمت قدیمی برای سازگاری
                const username = originalUser?.username || 'unknown';
                await channel.setName(`ticket-${String(ticketNumber).padStart(4, '0')}-${username}`);
            }

            // بازگرداندن دسترسی کاربر اصلی (اگر پیدا شد)
            if (originalUser) {
                await channel.permissionOverwrites.create(originalUser.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true
                });
            }

            // اضافه کردن مجدد به لیست تیکت‌های فعال (حتی اگر کاربر پیدا نشد)
            activeTickets.set(channel.id, {
                userId: originalUser?.id || null,
                createdAt: Date.now(), // زمان باز کردن مجدد
                ticketNumber: ticketNumber,
                channelId: channel.id
            });

            // بازگرداندن دسترسی رول‌های مجاز همگانی
            for (const roleId of TICKET_CONFIG.allowedRoles) {
                await channel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                    ManageMessages: true
                });
            }

            // صراحتاً عدم دسترسی برای این دو رول در حالت بازگشایی
            const denyRoles2 = ['1400919880017907797', '1400910230358851686'];
            for (const roleId of denyRoles2) {
                await channel.permissionOverwrites.create(roleId, {
                    ViewChannel: false,
                    SendMessages: false,
                    ReadMessageHistory: false,
                    AttachFiles: false,
                    EmbedLinks: false
                });
            }

            // اضافه کردن دسترسی رول‌های مخصوص به نوع تیکت (اگر وجود داشته باشد)
            const typeSpecificRoles = (TICKET_CONFIG.typeRoleAccess && TICKET_CONFIG.typeRoleAccess[ticketType]) || [];
            for (const roleId of typeSpecificRoles) {
                await channel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                    ManageMessages: true
                });
            }

            // پیام باز کردن مجدد تیکت (پیام موقت)
            const reopenEmbed = new EmbedBuilder()
                .setColor(0x000000) // تغییر رنگ به مشکی
                .setTitle('🔓 تیکت مجدداً باز شد')
                .setDescription('این تیکت توسط عضو تیم پشتیبانی مجدداً باز شد.')
                .addFields([
                    { name: '👤 باز شده توسط', value: interaction.user.toString(), inline: true },
                    { name: '🕒 زمان باز شدن', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                ])
                .setTimestamp();

            // ارسال پیام موقت که حذف می‌شود
            const tempMessage = await interaction.editReply({
                embeds: [reopenEmbed],
                components: []  // بدون دکمه
            });

            // حذف پیام بعد از 8 ثانیه
            setTimeout(async () => {
                try {
                    await tempMessage.delete();
                } catch (error) {
                    // اگر پیام قبلاً حذف شده، خطا نادیده گرفته می‌شود
                }
            }, 8000);

            // دکمه بستن تیکت حذف شد - فقط ادمین‌ها می‌توانند از slash command استفاده کنند

            // منشن کردن کاربر در تیکت بجای DM
            if (originalUser) {
                await channel.send({
                    content: `${originalUser} 🔓 **تیکت مجدداً باز شد** <@&1432688893106458705>`,
                    allowedMentions: { users: [originalUser.id], roles: ['1432688893106458705'] }
                });
            } else {
                await channel.send({
                    content: `<@&1432688893106458705> 🔓 **تیکت مجدداً باز شد**`,
                    allowedMentions: { roles: ['1432688893106458705'] }
                });
            }

            console.log(`✅ Ticket reopened: ${channel.name} by ${interaction.user.tag}`);

        } catch (error) {
            console.error('❌ Error reopening ticket:', error);
            await interaction.editReply({
                content: '❌ خطا در باز کردن مجدد تیکت!'
            });
        }
    }

    // حذف تیکت
    async deleteTicket(interaction) {
        try {
            // فقط ادمین کل بتواند حذف کند؛ رول‌ها نتوانند حذف کنند
            const member = interaction.member;
            const channel = interaction.channel;
            const hasAdminPermission = member.permissions.has(PermissionFlagsBits.Administrator);

            if (!hasAdminPermission) {
                return await interaction.reply({
                    content: '❌ شما دسترسی لازم برای حذف تیکت را ندارید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            // بررسی اینکه در کتگوری بسته است
            if (channel.parentId !== TICKET_CONFIG.closeCategoryId) {
                return await interaction.reply({
                    content: '❌ فقط تیکت‌های بسته شده قابل حذف هستند!',
                    flags: MessageFlags.Ephemeral
                });
            }

            // ایجاد embed سوال برای ترنسکریپت
            const transcriptQuestionEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('📋 آیا می‌خواهید ترنسکریپت تیکت ایجاد شود؟')
                .setDescription('قبل از حذف تیکت، آیا می‌خواهید یک ترنسکریپت کامل از تمام پیام‌های تیکت ایجاد شود؟')
                .addFields([
                    { name: '✅ بله', value: 'ترنسکریپت ایجاد می‌شود و سپس تیکت حذف می‌شود', inline: true },
                    { name: '❌ خیر', value: 'تیکت بدون ترنسکریپت حذف می‌شود', inline: true }
                ])
                .setFooter({ text: 'CLUBS_ticket' })
                .setTimestamp();

            // دکمه‌های انتخاب
            const yesButton = new ButtonBuilder()
                .setCustomId('delete_ticket_with_transcript')
                .setLabel('✅ بله - با ترنسکریپت')
                .setStyle(ButtonStyle.Success);

            const noButton = new ButtonBuilder()
                .setCustomId('delete_ticket_without_transcript')
                .setLabel('❌ خیر - بدون ترنسکریپت')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_delete_ticket')
                .setLabel('🚫 لغو حذف')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(yesButton, noButton, cancelButton);

            await interaction.reply({
                embeds: [transcriptQuestionEmbed],
                components: [row],
                flags: MessageFlags.Ephemeral
            });

            // ذخیره اطلاعات تیکت برای استفاده در دکمه‌ها
            this.pendingDeletions = this.pendingDeletions || new Map();
            const channelName = channel.name;
            
            // استخراج اطلاعات تیکت از نام چنل
            let ticketMatch = channelName.match(/^closed-ticket-(\d+)-(\w+)-(.+)$/);
            
            // اگر پیدا نشد، شاید فرمت قدیمی باشد
            if (!ticketMatch) {
                // قدیمی 1: closed-شماره-نوع-آیدی
                ticketMatch = channelName.match(/closed-(\d+)-(\w+)-(\d+)/);
                if (!ticketMatch) {
                    // قدیمی 2: closed-ticket-شماره-نام کاربر
                    ticketMatch = channelName.match(/closed-ticket-(\d+)-(.+)/);
                }
            }
            
            let ticketInfo = null;
            if (ticketMatch) {
                const ticketNumber = parseInt(ticketMatch[1]);
                
                if (ticketMatch.length === 4) {
                    // فرمت جدید: closed-ticket-شماره-موضوع-نام کاربر
                    const ticketType = ticketMatch[2];
                    const username = ticketMatch[3];
                    
                    // پیدا کردن آیدی کاربر از نام کاربری
                    let userId = null;
                    try {
                        const guild = interaction.guild;
                        const members = await guild.members.fetch();
                        const user = members.find(member => member.user.username === username)?.user;
                        userId = user?.id;
                    } catch (error) {
                        console.error('Error finding user by username:', error);
                    }
                    
                    ticketInfo = {
                        ticketNumber: ticketNumber,
                        userId: userId,
                        channelId: channel.id,
                        ticketType: ticketType
                    };
                } else if (ticketMatch.length === 3) {
                    // قدیمی 1: closed-شماره-نوع-آیدی
                    const ticketType = ticketMatch[2];
                    const userId = ticketMatch[3];
                    
                    ticketInfo = {
                        ticketNumber: ticketNumber,
                        userId: userId,
                        channelId: channel.id,
                        ticketType: ticketType
                    };
                } else {
                    // قدیمی 2: closed-ticket-شماره-نام کاربر
                    const username = ticketMatch[2];
                    
                    // پیدا کردن کاربر اصلی
                    let originalUserId = null;
                    try {
                        const guild = interaction.guild;
                        const members = await guild.members.fetch();
                        const originalUser = members.find(member => member.user.username === username)?.user;
                        originalUserId = originalUser?.id;
                    } catch (error) {
                        console.error('Error finding original user:', error);
                    }

                    ticketInfo = {
                        ticketNumber: ticketNumber,
                        userId: originalUserId,
                        channelId: channel.id
                    };
                }
            }

            // ذخیره اطلاعات برای استفاده در دکمه‌ها
            this.pendingDeletions.set(interaction.user.id, {
                channel: channel,
                ticketInfo: ticketInfo,
                interaction: interaction
            });

        } catch (error) {
            console.error('❌ Error deleting ticket:', error);
        }
    }

    // حذف تیکت با ترنسکریپت
    async deleteTicketWithTranscript(interaction) {
        try {
            const pendingData = this.pendingDeletions?.get(interaction.user.id);
            if (!pendingData) {
                return await interaction.reply({
                    content: '❌ اطلاعات تیکت یافت نشد! لطفاً دوباره تلاش کنید.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const { channel, ticketInfo } = pendingData;

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // ایجاد ترنسکریپت
            const transcript = await this.generateTranscript(channel, ticketInfo);
            
            // ارسال ترنسکریپت
            await this.sendTranscript(transcript, ticketInfo);

            // تاخیر 3 ثانیه برای خواندن پیام
            setTimeout(async () => {
                try {
                    await channel.delete();
                    console.log(`✅ Ticket deleted with transcript: ${channel.name} by ${interaction.user.tag}`);
                    // ارسال لاگ حذف تیکت
                    await this.sendTicketActionLog({
                        guild: interaction.guild,
                        actorUser: interaction.user,
                        ticketNumber: ticketInfo?.ticketNumber || 0,
                        action: 'Deleted'
                    });
                } catch (error) {
                    console.error('❌ Error deleting ticket:', error);
                }
            }, 3000);

            // حذف از لیست انتظار
            this.pendingDeletions.delete(interaction.user.id);

            await interaction.editReply({
                content: '✅ تیکت با ترنسکریپت در حال حذف...'
            });

        } catch (error) {
            console.error('❌ Error deleting ticket with transcript:', error);
            await interaction.editReply({
                content: '❌ خطا در حذف تیکت!'
            });
        }
    }

    // حذف تیکت بدون ترنسکریپت
    async deleteTicketWithoutTranscript(interaction) {
        try {
            const pendingData = this.pendingDeletions?.get(interaction.user.id);
            if (!pendingData) {
                return await interaction.reply({
                    content: '❌ اطلاعات تیکت یافت نشد! لطفاً دوباره تلاش کنید.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const { channel, ticketInfo } = pendingData;

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // تاخیر 3 ثانیه برای خواندن پیام
            setTimeout(async () => {
                try {
                    await channel.delete();
                    console.log(`✅ Ticket deleted without transcript: ${channel.name} by ${interaction.user.tag}`);
                    // ارسال لاگ حذف تیکت
                    await this.sendTicketActionLog({
                        guild: interaction.guild,
                        actorUser: interaction.user,
                        ticketNumber: ticketInfo?.ticketNumber || 0,
                        action: 'Deleted'
                    });
                } catch (error) {
                    console.error('❌ Error deleting ticket:', error);
                }
            }, 3000);

            // حذف از لیست انتظار
            this.pendingDeletions.delete(interaction.user.id);

            await interaction.editReply({
                content: '✅ تیکت بدون ترنسکریپت در حال حذف...'
            });

        } catch (error) {
            console.error('❌ Error deleting ticket without transcript:', error);
            await interaction.editReply({
                content: '❌ خطا در حذف تیکت!'
            });
        }
    }

    // لغو حذف تیکت
    async cancelDeleteTicket(interaction) {
        try {
            const pendingData = this.pendingDeletions?.get(interaction.user.id);
            if (!pendingData) {
                return await interaction.reply({
                    content: '❌ اطلاعات تیکت یافت نشد! لطفاً دوباره تلاش کنید.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // حذف از لیست انتظار
            this.pendingDeletions.delete(interaction.user.id);

            await interaction.reply({
                content: '🚫 حذف تیکت لغو شد.',
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('❌ Error canceling ticket deletion:', error);
            await interaction.reply({
                content: '❌ خطا در لغو حذف تیکت!',
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // تولید ترنسکریپت
    async generateTranscript(channel, ticketInfo) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const sortedMessages = Array.from(messages.values()).reverse();
            const openerTag = await this.client.users.fetch(ticketInfo.userId).then(u => u.tag).catch(() => 'نامشخص');

            function escapeHtml(value) {
                try {
                    return (value || '')
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                } catch (_) { return ''; }
            }

            let html = `<!doctype html>
<html lang="fa"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Transcript #${String(ticketInfo.ticketNumber).padStart(4, '0')}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,IRANSans;background:#1e1f22;color:#f2f3f5;margin:0;padding:24px}
.container{max-width:1000px;margin:0 auto}
.header{background:#2b2d31;border:1px solid #1e1f22;border-radius:12px;padding:16px 20px;margin-bottom:16px}
.h{margin:0 0 8px 0;font-size:18px}
.meta{color:#b5bac1;font-size:13px}
.msg{display:grid;grid-template-columns:56px 1fr;gap:12px;padding:12px 14px;border-bottom:1px solid #2b2d31}
.avatar{width:40px;height:40px;border-radius:50%;background:#2b2d31}
.author{font-weight:600;color:#e3e5e8}
.time{color:#a3a6aa;font-size:12px;margin-inline-start:8px}
.content{white-space:pre-wrap;word-wrap:break-word;line-height:1.6}
.attach{margin-top:6px}
.attach a{color:#949cf7;text-decoration:none}
.attach a:hover{text-decoration:underline}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;background:#5865f2;color:#fff;font-size:12px;margin-inline-start:8px}
</style>
</head><body>
    <div class="container">
        <div class="header">
            <div class="h">📋 ترنسکریپت تیکت #${String(ticketInfo.ticketNumber).padStart(4, '0')} <span class="badge">Discord Style</span></div>
            <div class="meta">🏷️ نام چنل: ${escapeHtml(channel.name)}</div>
            <div class="meta">👤 کاربر: ${escapeHtml(openerTag)} (${escapeHtml(ticketInfo.userId || 'نامشخص')})</div>
            <div class="meta">🕒 زمان ایجاد: ${escapeHtml(new Date(ticketInfo.createdAt).toLocaleString('fa-IR'))}</div>
            <div class="meta">🕒 زمان بسته شدن: ${escapeHtml(new Date().toLocaleString('fa-IR'))}</div>
        </div>`;

            for (const message of sortedMessages) {
                if (message.author.bot && message.author.id === this.client.user.id) continue;
                const timestamp = new Date(message.createdTimestamp).toLocaleString('fa-IR');
                const avatar = message.author.displayAvatarURL ? message.author.displayAvatarURL({ size: 64 }) : '';
                html += `
        <div class="msg">
            <div>
                <img class="avatar" src="${escapeHtml(avatar)}" alt="" onerror="this.style.display='none'" />
            </div>
            <div>
                <div>
                    <span class="author">${escapeHtml(message.author.tag)}</span>
                    <span class="time">${escapeHtml(timestamp)}</span>
                </div>
                <div class="content">${escapeHtml(message.content || '')}</div>
                ${message.attachments.size > 0 ? `<div class="attach">${Array.from(message.attachments.values()).map(a => `<div>📎 <a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.name || a.url)}</a></div>`).join('')}</div>` : ''}
            </div>
        </div>`;
            }

            html += `
    </div>
</body></html>`;

            return html;
        } catch (error) {
            console.error('❌ Error generating transcript:', error);
            return 'خطا در تولید ترنسکریپت';
        }
    }

    // ارسال ترنسکریپت
    async sendTranscript(transcript, ticketInfo) {
        try {
            const transcriptChannel = await this.client.channels.fetch(TICKET_CONFIG.transcriptChannelId);
            const originalUser = await this.client.users.fetch(ticketInfo.userId);

            if (transcriptChannel) {
                const transcriptEmbed = new EmbedBuilder()
                    .setColor(0x000000) // تغییر رنگ به مشکی
                    .setTitle('📋 ترنسکریپت تیکت جدید')
                    .setDescription(`تیکت #${String(ticketInfo.ticketNumber).padStart(4, '0')} بسته شد.`)
                    .addFields([
                        { name: '👤 کاربر', value: originalUser ? `${originalUser.tag} (${originalUser.id})` : 'نامشخص', inline: true },
                        { name: '🕒 زمان بسته شدن', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '🔢 شماره تیکت', value: `#${String(ticketInfo.ticketNumber).padStart(4, '0')}`, inline: true }
                    ])
                    .setFooter({ text: 'سیستم ترنسکریپت تیکت' })
                    .setTimestamp();

                // ارسال embed و فایل ترنسکریپت به چنل
                await transcriptChannel.send({
                    embeds: [transcriptEmbed],
                    files: [{
                        attachment: Buffer.from(transcript, 'utf8'),
                        name: `ticket-${String(ticketInfo.ticketNumber).padStart(4, '0')}-transcript.html`
                    }]
                });

                console.log(`✅ Transcript sent to channel ${transcriptChannel.name}`);
            } else {
                console.error('❌ Transcript channel not found');
            }

        } catch (error) {
            console.error('❌ Error sending transcript:', error);
        }
    }

    // مدیریت کلیک دکمه‌ها
    async handleButtonInteraction(interaction) {
        const { customId } = interaction;

        switch (customId) {
            case 'create_ticket':
                await this.createTicket(interaction, 'server_complaint');
                break;
            case 'create_ticket_membership':
                await this.createTicket(interaction, 'membership');
                break;
            case 'create_ticket_complaint':
                await this.createTicket(interaction, 'server_complaint');
                break;
            case 'create_ticket_suggestion':
                await this.createTicket(interaction, 'suggestions');
                break;
            case 'create_ticket_collaboration':
                await this.createTicket(interaction, 'collaboration');
                break;
            case 'ticket_select':
                // select menus send their customId but values contain the chosen option
                // this branch is kept for backward compatibility; actual select handling
                // is done in handleSelectInteraction below when the bot routes selects.
                break;
            case 'close_ticket':
                await this.closeTicket(interaction);
                break;
            case 'reopen_ticket':
                await this.reopenTicket(interaction);
                break;
            case 'delete_ticket':
                await this.deleteTicket(interaction);
                break;
            case 'delete_ticket_with_transcript':
                await this.deleteTicketWithTranscript(interaction);
                break;
            case 'delete_ticket_without_transcript':
                await this.deleteTicketWithoutTranscript(interaction);
                break;
            case 'cancel_delete_ticket':
                await this.cancelDeleteTicket(interaction);
                break;
        }
    }

    // handle select (StringSelect) interactions from the ticket panel
    async handleSelectInteraction(interaction) {
        try {
            if (!interaction || !interaction.values || !interaction.values.length) {
                return await interaction.reply({ content: '❌ انتخاب نامعتبر است.', flags: MessageFlags.Ephemeral });
            }

            const value = interaction.values[0];

            // Map values directly to ticket types defined in TICKET_CONFIG
            const allowed = Object.keys(TICKET_CONFIG.ticketTypes);
            const ticketType = allowed.includes(value) ? value : 'server_complaint';

            // Create the ticket
            await this.createTicket(interaction, ticketType);
        } catch (error) {
            console.error('❌ Error handling select interaction:', error);
            try {
                if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: '❌ خطا در پردازش انتخاب شما.', flags: MessageFlags.Ephemeral });
            } catch (_) {}
        }
    }

    // ایجاد پنل تیکت
    async createTicketPanel(channel) {
        try {
            // A richer, darker purple-styled embed to match the requested design
            const panelEmbed = new EmbedBuilder()
                .setColor(0x000000) 
                    .setAuthor({ name: 'CLUBS', iconURL: this.client.user?.displayAvatarURL?.({ size: 64 }) })
                    .setTitle('📩 پنل پشتیبانی و درخواست‌ها')
                .setDescription('لطفاً نوع درخواست خود را انتخاب کنید. قبل از ارسال، توضیحات و مدارک لازم را آماده کنید.')
                .addFields([
                    { name: ' نکات مهم', value: '• هر کاربر فقط یک تیکت فعال می‌تواند داشته باشد\n• در صورت نیاز مدارک را ضمیمه کنید\n• از ارسال چند تیکت هم‌موضوع خودداری کنید', inline: false }
                ])
                    .setFooter({ text: 'برای انتخاب، روی منوی زیر کلیک کنید' });

                // use guild icon as thumbnail if available
                try {
                    const guild = channel.guild;
                    const icon = guild?.iconURL?.({ size: 128 });
                    if (icon) panelEmbed.setThumbnail(icon);
                } catch (e) {}

            // Create a select menu (drop-down) with the requested ticket types
            const select = new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('انتخاب نوع تیکت...')
                .addOptions([
                    { label: 'همکاری', description: 'درخواست همکاری و مشارکت', value: 'collaboration', emoji: '🤝' },
                    { label: 'شکایت', description: 'گزارش مشکل یا شکایت از سرور', value: 'server_complaint', emoji: '🚨' },
                    { label: 'انتقادات', description: 'ارسال پیشنهاد یا انتقاد', value: 'suggestions', emoji: '💡' },
                    { label: 'بررسی بن', description: 'درخواست بررسی بن شدن', value: 'ban_review', emoji: '🛡️' },
                    { label: 'درخواست VIP', description: 'درخواست دریافت VIP', value: 'vip_request', emoji: '💎' }
                ]);

            const row = new ActionRowBuilder().addComponents(select);

            await channel.send({
                embeds: [panelEmbed],
                components: [row]
            });

            console.log('✅ Ticket panel created (select menu)');

        } catch (error) {
            console.error('❌ Error creating ticket panel:', error);
        }
    }

    // اضافه کردن کاربر یا رول به تیکت
    async addToTicket(interaction) {
        try {
            // بررسی دسترسی: ادمین، رول مجاز یا کسانی که ManageChannels دارند
            const member = interaction.member;
            const channel = interaction.channel;
            const hasAdminPermission = member.permissions.has(PermissionFlagsBits.Administrator);
            const hasAllowedRole = TICKET_CONFIG.allowedRoles.some(roleId => member.roles.cache.has(roleId));
            const hasManageChannels = channel.permissionsFor(member)?.has(PermissionFlagsBits.ManageChannels);

            if (!hasAdminPermission && !hasAllowedRole && !hasManageChannels) {
                return await interaction.reply({
                    content: '❌ شما دسترسی لازم برای اضافه کردن به تیکت را ندارید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            // بررسی اینکه در تیکت هستیم
            if (!channel.parentId || 
                (channel.parentId !== TICKET_CONFIG.openCategoryId && 
                 channel.parentId !== TICKET_CONFIG.closeCategoryId)) {
                return await interaction.reply({
                    content: '❌ این دستور فقط در تیکت‌ها قابل استفاده است!',
                    flags: MessageFlags.Ephemeral
                });
            }

            const user = interaction.options.getUser('user');
            const role = interaction.options.getRole('role');

            if (!user && !role) {
                return await interaction.reply({
                    content: '❌ لطفاً یک کاربر یا رول را انتخاب کنید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let addedItems = [];

            // اضافه کردن کاربر
            if (user) {
                if (user.bot) {
                    return await interaction.editReply({
                        content: '❌ نمی‌توانید ربات را به تیکت اضافه کنید!'
                    });
                }

                await channel.permissionOverwrites.create(user.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true
                });

                addedItems.push(`👤 ${user.toString()}`);
            }

            // اضافه کردن رول
            if (role) {
                if (role.id === interaction.guild.roles.everyone.id) {
                    return await interaction.editReply({
                        content: '❌ نمی‌توانید رول @everyone را اضافه کنید!'
                    });
                }

                await channel.permissionOverwrites.create(role.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true
                });

                addedItems.push(`🎭 ${role.toString()}`);
            }

            // پیام تأیید
            await interaction.editReply({
                content: `✅ با موفقیت اضافه شد:\n${addedItems.join('\n')}`
            });

            // اطلاع‌رسانی در تیکت
            const embed = new EmbedBuilder()
                .setColor(0x000000) // تغییر رنگ به مشکی
                .setDescription(`➕ **${interaction.user.toString()} اضافه کرد:**\n${addedItems.join('\n')}`)
                .setFooter({ text: 'CLUBS_ticket' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            console.log(`✅ Added to ticket ${channel.name}: ${addedItems.join(', ')} by ${interaction.user.tag}`);

        } catch (error) {
            console.error('❌ Error adding to ticket:', error);
            await interaction.editReply({
                content: '❌ خطا در اضافه کردن به تیکت!'
            });
        }
    }
}

// دستورات تیکت
const ticketCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('ticket-panel')
            .setDescription('ایجاد پنل تیکت در چنل فعلی'),
        async execute(interaction) {
            // بررسی دسترسی ادمین
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: '❌ شما دسترسی لازم برای استفاده از این دستور را ندارید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            const ticketManager = new TicketManager(interaction.client);
            await ticketManager.createTicketPanel(interaction.channel);
            
            await interaction.reply({
                content: '✅ پنل تیکت با موفقیت ایجاد شد!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('ticket-stats')
            .setDescription('نمایش آمار تیکت‌ها'),
        async execute(interaction) {
            // بررسی دسترسی
            const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
                                TICKET_CONFIG.allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId));

            if (!hasPermission) {
                return await interaction.reply({
                    content: '❌ شما دسترسی لازم برای مشاهده آمار تیکت‌ها را ندارید!',
                    flags: MessageFlags.Ephemeral
                });
            }

            const activeCount = activeTickets.size;
            const totalTickets = ticketCounter - 1;

            const statsEmbed = new EmbedBuilder()
                .setColor(0x000000) // تغییر رنگ به مشکی
                .setTitle('📊 آمار سیستم تیکت')
                .addFields([
                    { name: '🎫 تیکت‌های فعال', value: activeCount.toString(), inline: true },
                    { name: '📈 کل تیکت‌ها', value: totalTickets.toString(), inline: true },
                    { name: '🔒 تیکت‌های بسته', value: (totalTickets - activeCount).toString(), inline: true }
                ])
                .setTimestamp();

            await interaction.reply({
                embeds: [statsEmbed],
                flags: MessageFlags.Ephemeral
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('add')
            .setDescription('اضافه کردن کاربر یا رول به تیکت')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('کاربری که می‌خواهید به تیکت اضافه کنید')
                    .setRequired(false))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('رولی که می‌خواهید به تیکت اضافه کنید')
                    .setRequired(false)),
        async execute(interaction) {
            const ticketManager = new TicketManager(interaction.client);
            await ticketManager.addToTicket(interaction);
        }
    }
];

module.exports = {
    TicketManager,
    ticketCommands,
    TICKET_CONFIG
};
