const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { fetch } = require('undici');

// Avatar Command
const avatarCommand = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('نمایش آواتار کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر مورد نظر')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });
        
        const embed = new EmbedBuilder()
            .setTitle(`آواتار ${user.username}`)
            .setImage(avatarURL)
            .setColor('#0099ff')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

// Ban Command
const banCommand = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('بن کردن کاربر از سرور')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('دلیل')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'بدون دلیل';
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ شما مجوز بن کردن کاربران را ندارید!', flags: MessageFlags.Ephemeral });
        }
        // Prevent banning the protected owner user ID
        if (user.id === '995631414907244646') {
            return interaction.reply({ content: '❌ امکان بن کردن مالک سرور وجود ندارد.', flags: MessageFlags.Ephemeral });
        }
        
        try {
            // Try DM first
            try {
                await user.send(`⛔ You have been banned from ${interaction.guild.name}.\nReason: ${reason}`);
            } catch (_) {}
            await interaction.guild.members.ban(user, { reason });
            
            const embed = new EmbedBuilder()
                .setTitle('✅ کاربر بن شد')
                .setDescription(`**کاربر:** ${user.tag}\n**دلیل:** ${reason}\n**توسط:** ${interaction.user.tag}`)
                .setColor('#ff0000')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ خطا در بن کردن کاربر!', flags: MessageFlags.Ephemeral });
        }
    }
};

// Kick Command
const kickCommand = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('کیک کردن کاربر از سرور')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('دلیل')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'بدون دلیل';
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: '❌ شما مجوز کیک کردن کاربران را ندارید!', flags: MessageFlags.Ephemeral });
        }
        // Prevent kicking the protected owner user ID
        if (user.id === '995631414907244646') {
            return interaction.reply({ content: '❌ امکان کیک کردن مالک سرور وجود ندارد.', flags: MessageFlags.Ephemeral });
        }
        
        try {
            const member = await interaction.guild.members.fetch(user.id);
            // Try DM first
            try {
                await user.send(`🚪 You have been kicked from ${interaction.guild.name}.\nReason: ${reason}`);
            } catch (_) {}
            await member.kick(reason);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ کاربر کیک شد')
                .setDescription(`**کاربر:** ${user.tag}\n**دلیل:** ${reason}\n**توسط:** ${interaction.user.tag}`)
                .setColor('#ffaa00')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ خطا در کیک کردن کاربر!', flags: MessageFlags.Ephemeral });
        }
    }
};

// Clear Command
const clearCommand = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('پاک کردن پیام‌ها')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('تعداد پیام‌هایی که میخوای پاک کنی (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ شما مجوز مدیریت پیام‌ها را ندارید!', flags: MessageFlags.Ephemeral });
        }
        
        try {
			const messages = await interaction.channel.bulkDelete(amount, true);
			const deletedCount = messages?.size || 0;
			// Send moderation log to the specified channel
			try {
				const LOG_CHANNEL_ID = '1402073143354589296';
				const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
				if (logChannel && logChannel.send) {
					const text = `🧹 ${interaction.user.tag} تعداد ${deletedCount} پیام را در چنل <#${interaction.channel.id}> پاک کرد`;
					await logChannel.send({ content: text });
				}
			} catch (_) {}
            
            const embed = new EmbedBuilder()
                .setTitle('✅ پیام‌ها پاک شدند')
				.setDescription(`**تعداد پیام‌های پاک شده:** ${messages.size}\n**توسط:** ${interaction.user.tag}`)
                .setColor('#00ff00')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: '❌ خطا در پاک کردن پیام‌ها!', flags: MessageFlags.Ephemeral });
        }
    }
};

// Warn Command
const warnCommand = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('اخطار دادن به کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربری که میخوای اخطار بدی')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('دلیل اخطار')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ شما مجوز اخطار دادن را ندارید!', flags: MessageFlags.Ephemeral });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('⚠️ اخطار')
            .setDescription(`**کاربر:** ${user}\n**دلیل:** ${reason}\n**توسط:** ${interaction.user.tag}`)
            .setColor('#ffff00')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // store warn in memory
        try {
            if (!interaction.client.warns) interaction.client.warns = new Map();
            const arr = interaction.client.warns.get(user.id) || [];
            arr.push({ reason, moderatorTag: interaction.user.tag, timestamp: Date.now() });
            interaction.client.warns.set(user.id, arr);
        } catch {}

        // Send DM to warned user
        try {
            await user.send(`⚠️ شما در سرور ${interaction.guild.name} اخطار دریافت کردید!\n**دلیل:** ${reason}`);
        } catch (error) {
            console.log('Could not send DM to user');
        }
    }
};

// Warn2 Command (Warn + 1 hour timeout)
const warn2Command = {
    data: new SlashCommandBuilder()
        .setName('warn2')
        .setDescription('اخطار با تایم‌اوت ۱ ساعته برای کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربری که میخوای اخطار بدی و تایم‌اوت شود')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('دلیل اخطار/تایم‌اوت')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Warn2 - 1h timeout';

        // Permission checks
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ شما مجوز مدیریت تایم‌اوت را ندارید!', flags: MessageFlags.Ephemeral });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ ربات دسترسی Moderate Members ندارد.', flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            if (!member) {
                return interaction.reply({ content: '❌ کاربر در سرور یافت نشد.', flags: MessageFlags.Ephemeral });
            }

            // Check hierarchy ability
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ امکان اعمال تایم‌اوت روی این کاربر وجود ندارد (نقش‌ها/دسترسی‌ها).', flags: MessageFlags.Ephemeral });
            }

            const durationMs = 60 * 60 * 1000; // 1 hour
            const until = new Date(Date.now() + durationMs);
            await member.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setTitle('⚠️ Warn2 + ⏳ تایم‌اوت ۱ ساعته')
                .setDescription(`**کاربر:** ${user}\n**دلیل:** ${reason}\n**تا:** <t:${Math.floor(until.getTime() / 1000)}:F>\n**توسط:** ${interaction.user.tag}`)
                .setColor('#e67e22')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // store warn in memory
            try {
                if (!interaction.client.warns) interaction.client.warns = new Map();
                const arr = interaction.client.warns.get(user.id) || [];
                arr.push({ reason, moderatorTag: interaction.user.tag, timestamp: Date.now(), timeoutMs: durationMs });
                interaction.client.warns.set(user.id, arr);
            } catch {}

            // Try DM the user
            try {
                await user.send(`⚠️ شما در سرور ${interaction.guild.name} Warn2 گرفتید و به مدت 1 ساعت تایم‌اوت شدید.\n**دلیل:** ${reason}`);
            } catch (_) {
                // ignore DM failures
            }
        } catch (error) {
            await interaction.reply({ content: '❌ خطا در اعمال تایم‌اوت!', flags: MessageFlags.Ephemeral });
        }
    }
};

// Warn List Command
const warnlistCommand = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('نمایش اخطارهای کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (!interaction.client.warns) interaction.client.warns = new Map();
        const warns = interaction.client.warns.get(user.id) || [];

        if (warns.length === 0) {
            return interaction.reply({ content: `ℹ️ کاربر ${user} هیچ اخطاری ندارد.`, flags: MessageFlags.Ephemeral });
        }

        const lines = warns.slice(-25).map((w, idx) => {
            const time = Math.floor((w.timestamp || Date.now()) / 1000);
            return `**${idx + 1}.** <t:${time}:F> — ${w.reason} (by ${w.moderatorTag})`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`📄 اخطارهای ${user.tag}`)
            .setDescription(lines.join('\n'))
            .setColor('#f1c40f')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};

// Clear Warns Command
const clearwarnsCommand = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('پاک کردن اخطارهای کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ شما مجوز لازم را ندارید.', flags: MessageFlags.Ephemeral });
        }
        if (!interaction.client.warns) interaction.client.warns = new Map();
        interaction.client.warns.delete(user.id);

        await interaction.reply({ content: `✅ تمام اخطارهای ${user.tag} پاک شد.`, flags: MessageFlags.Ephemeral });
    }
};

// Delete Message User Command
const deletemessageuserCommand = {
    data: new SlashCommandBuilder()
        .setName('deletemessageuser')
        .setDescription('حذف پیام‌های یک کاربر در این چنل (با محدودیت 14 روز)')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('تعداد پیام قابل حذف از آن کاربر (1-1000)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ شما مجوز Manage Messages ندارید.', flags: MessageFlags.Ephemeral });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ ربات مجوز Manage Messages ندارد.', flags: MessageFlags.Ephemeral });
        }

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        try {
            const channel = interaction.channel;
            let collected = [];
            let lastId = undefined;
            let fetchedCount = 0;
            // Fetch messages in pages until we have enough candidates or no more messages
            while (collected.length < amount) {
                const batch = await channel.messages.fetch({ limit: 100, before: lastId }).catch(() => null);
                if (!batch || batch.size === 0) break;
                fetchedCount += batch.size;
                // Filter by author and age < 14 days
                for (const [, msg] of batch) {
                    if (msg.author?.id === target.id && (now - msg.createdTimestamp) < FOURTEEN_DAYS_MS) {
                        collected.push(msg);
                        if (collected.length >= amount) break;
                    }
                }
                lastId = batch.last()?.id;
                if (!lastId) break;
                // Safety cap to avoid excessive pagination
                if (fetchedCount >= 5000) break;
            }

            if (collected.length === 0) {
                return interaction.reply({ content: 'ℹ️ پیامی برای حذف یافت نشد (یا قدیمی‌تر از 14 روز است).', flags: MessageFlags.Ephemeral });
            }

            // Delete in chunks of up to 100
            let deletedTotal = 0;
            for (let i = 0; i < collected.length; i += 100) {
                const chunk = collected.slice(i, i + 100);
                try {
                    const res = await channel.bulkDelete(chunk, true);
                    deletedTotal += res?.size || 0;
                } catch (_) {
                    // ignore chunk failures and continue
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('🧹 حذف پیام‌ها انجام شد')
                .setDescription(`تعداد ${deletedTotal} پیام از ${target} حذف شد.`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (e) {
            await interaction.reply({ content: '❌ خطا در حذف پیام‌ها.', flags: MessageFlags.Ephemeral });
        }
    }
};

// Remind Command
const remindCommand = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('یادآور زمان‌دار')
        .addStringOption(o => o.setName('time').setDescription('زمان مثل 10m/2h/1d').setRequired(true))
        .addStringOption(o => o.setName('message').setDescription('متن یادآور').setRequired(true)),

    async execute(interaction) {
        const timeStr = interaction.options.getString('time');
        const message = interaction.options.getString('message');

        function parseDuration(str) {
            const match = str.match(/^(\d+)(s|m|h|d)$/i);
            if (!match) return null;
            const value = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
            return value * map[unit];
        }

        const ms = parseDuration(timeStr);
        if (!ms || ms <= 0 || ms > 30 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ content: '❌ زمان نامعتبر است. از قالبی مثل 10m/2h/1d استفاده کنید (حداکثر 30 روز).', flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `⏰ یادآور تنظیم شد و در <t:${Math.floor((Date.now() + ms)/1000)}:R> یادآوری می‌شود.`, flags: MessageFlags.Ephemeral });

        setTimeout(async () => {
            try {
                await interaction.followUp({ content: `⏰ ${interaction.user} یادآور: ${message}` });
            } catch {}
        }, ms);
    }
};

// Weather Command (Open-Meteo)
const weatherCommand = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('وضعیت آب‌وهوا برای یک شهر')
        .addStringOption(o => o.setName('city').setDescription('نام شهر (مثلاً Tehran)').setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa`);
            const geo = await geoRes.json();
            const loc = geo?.results?.[0];
            if (!loc) return interaction.reply({ content: '❌ شهر یافت نشد.', flags: MessageFlags.Ephemeral });

            const lat = loc.latitude, lon = loc.longitude;
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
            const w = await wRes.json();
            const c = w?.current;
            if (!c) return interaction.reply({ content: '❌ دریافت اطلاعات آب‌وهوا ممکن نشد.', flags: MessageFlags.Ephemeral });

            const embed = new EmbedBuilder()
                .setTitle(`🌤️ آب‌وهوا: ${loc.name}${loc.country ? ' - ' + loc.country : ''}`)
                .addFields(
                    { name: 'دما', value: `${c.temperature_2m}°C`, inline: true },
                    { name: 'رطوبت', value: `${c.relative_humidity_2m}%`, inline: true },
                    { name: 'سرعت باد', value: `${c.wind_speed_10m} m/s`, inline: true }
                )
                .setColor('#3498db')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            await interaction.reply({ content: '❌ خطا در دریافت آب‌وهوا.', flags: MessageFlags.Ephemeral });
        }
    }
};

// Time Command (local time for a city)
const timeCommand = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('زمان محلی یک شهر')
        .addStringOption(o => o.setName('city').setDescription('نام شهر (مثلاً Tehran)').setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa`);
            const geo = await geoRes.json();
            const loc = geo?.results?.[0];
            if (!loc) return interaction.reply({ content: '❌ شهر یافت نشد.', flags: MessageFlags.Ephemeral });

            const tz = loc.timezone || 'UTC';
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeStyle: 'long', timeZone: tz });
            const formatted = formatter.format(now);

            const embed = new EmbedBuilder()
                .setTitle(`🕒 زمان محلی: ${loc.name}`)
                .setDescription(`${formatted} \n\n(منطقه زمانی: ${tz})`)
                .setColor('#8e44ad')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            await interaction.reply({ content: '❌ خطا در دریافت زمان.', flags: MessageFlags.Ephemeral });
        }
    }
};

// (translate command removed by user request)

// Server Info Command
const serverinfoCommand = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('اطلاعات سرور'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        
        const embed = new EmbedBuilder()
            .setTitle(`اطلاعات سرور ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 صاحب سرور', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 تعداد اعضا', value: `${guild.memberCount}`, inline: true },
                { name: '📅 تاریخ ایجاد', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🆔 آیدی سرور', value: guild.id, inline: true },
                { name: '📊 تعداد چنل‌ها', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 تعداد رول‌ها', value: `${guild.roles.cache.size}`, inline: true }
            )
            .setColor('#0099ff')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

// User Info Command
const userinfoCommand = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('اطلاعات کاربر')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربر مورد نظر')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        const embed = new EmbedBuilder()
            .setTitle(`اطلاعات ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🏷️ نام کاربری', value: user.tag, inline: true },
                { name: '🆔 آیدی', value: user.id, inline: true },
                { name: '📅 تاریخ عضویت', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'نامشخص', inline: true },
                { name: '📅 تاریخ ایجاد اکانت', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 رول‌ها', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'نامشخص', inline: false }
            )
            .setColor('#0099ff')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

// Say Command
const sayCommand = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('ارسال پیام همراه با امبد سفارشی')
        .addStringOption(option =>
            option.setName('content')
                .setDescription('متن خارج از امبد (پیام معمولی)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('عنوان بزرگ امبد')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('متن داخل امبد (زیر عنوان)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('آدرس عکس برای نمایش در امبد (URL)')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('کاربری که می‌خواهی منشن شود')
                .setRequired(false)),
    
    async execute(interaction) {
        const content = interaction.options.getString('content');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const image = interaction.options.getString('image');
        const user = interaction.options.getUser('user');

        if (!content && !title && !description && !image && !user) {
            return interaction.reply({ content: '❌ حداقل یکی از فیلدها (content/title/description/image/user) را وارد کنید.', flags: MessageFlags.Ephemeral });
        }

        const embeds = [];
        let contentToSend = content || '';
        if (user) contentToSend = `<@${user.id}> ${contentToSend}`.trim();
        if (title || description || image) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTimestamp()
                .setFooter({ text: `ارسال شده توسط ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            if (title) embed.setTitle(`**${title}**`);
            if (description) embed.setDescription(description);
            if (image) embed.setImage(image);
            embeds.push(embed);
        }

        await interaction.reply({ content: contentToSend || undefined, embeds, allowedMentions: { parse: ['users', 'everyone'] } });
    }
};

// Help Command
const helpCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('لیست دستورات ربات'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 لیست دستورات ربات')
            .setDescription('دستورات موجود در ربات:')
            .addFields(
				{ name: '👤 دستورات کاربری', value: '`/avatar` - نمایش آواتار\n`/userinfo` - اطلاعات کاربر\n`/serverinfo` - اطلاعات سرور\n`/help` - لیست دستورات', inline: false },
				{ name: '🛡️ دستورات مدیریتی', value: '`/ban` `/kick` `/warn` `/warn2` `/warnlist` `/clearwarns` `/clear` `/reactionrole` `/autoreaction` `/send dm`', inline: false },
				{ name: '🧰 ابزارها', value: '`/say` `/remind` `/weather` `/time`', inline: false }
            )
            .setColor('#0099ff')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

// Reaction Role Command
const reactionroleCommand = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('تنظیم نقش‌دهی با ریاکشن روی یک پیام')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('ایموجی/استیکر برای ریاکشن (مثلاً 😀 یا <:name:id>)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('نقشی که با ریاکشن داده می‌شود')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message_link')
                .setDescription('لینک پیام هدف (Right click > Copy Link)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const emojiInput = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');
        const messageLink = interaction.options.getString('message_link');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '❌ ربات مجوز Manage Roles ندارد.', flags: MessageFlags.Ephemeral });
        }

        // Parse message link: https://discord.com/channels/{guildId}/{channelId}/{messageId}
        const linkRegex = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
        const match = messageLink.match(linkRegex);
        if (!match) {
            return interaction.reply({ content: '❌ لینک پیام نامعتبر است.', flags: MessageFlags.Ephemeral });
        }
        const [, guildId, channelId, messageId] = match;
        if (guildId !== interaction.guild.id) {
            return interaction.reply({ content: '❌ لینک مربوط به این سرور نیست.', flags: MessageFlags.Ephemeral });
        }

        try {
            const channel = await interaction.client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);

            // Determine emoji key and react
            // Support custom emoji formats: <:name:id> or <a:name:id>
            let emojiKey = null;
            const customEmojiMatch = emojiInput.match(/^<a?:\w+:(\d+)>$/);
            if (customEmojiMatch) {
                // Custom emoji by ID
                emojiKey = customEmojiMatch[1];
                await message.react(emojiKey);
            } else {
                // Assume unicode emoji
                emojiKey = emojiInput;
                await message.react(emojiKey);
            }

            // Initialize map container
            if (!interaction.client.reactionRoles) {
                interaction.client.reactionRoles = new Map();
            }

            const mapKey = `${messageId}`;
            const existing = interaction.client.reactionRoles.get(mapKey) || {};
            // Store by emoji key
            existing[emojiKey] = role.id;
            interaction.client.reactionRoles.set(mapKey, existing);

            const embed = new EmbedBuilder()
                .setTitle('✅ ریاکشن رول تنظیم شد')
                .setDescription(`به پیام [لینک](${messageLink}) ایموجی ${emojiInput} اضافه شد.
با زدن این ریاکشن، نقش <@&${role.id}> داده می‌شود.`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            await interaction.reply({ content: '❌ خطا در تنظیم ریاکشن رول یا دسترسی به پیام.', flags: MessageFlags.Ephemeral });
        }
    }
};

// Send Command (/send dm)
const sendCommand = {
	data: new SlashCommandBuilder()
		.setName('send')
		.setDescription('ارسال پیام خصوصی')
		.addSubcommand(sub =>
			sub.setName('dm')
				.setDescription('ارسال پیام به DM یک کاربر با آیدی عددی')
				.addStringOption(opt =>
					opt.setName('user_id')
						.setDescription('آیدی عددی کاربر (مثلاً 123456789012345678)')
						.setRequired(true))
				.addStringOption(opt =>
					opt.setName('message')
						.setDescription('متن پیام معمولی (اختیاری)')
						.setRequired(false))
				.addStringOption(opt =>
					opt.setName('embed')
						.setDescription('متن داخل امبد (اختیاری)')
						.setRequired(false)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		if (sub !== 'dm') return;

		const userId = interaction.options.getString('user_id');
		const plainText = interaction.options.getString('message');
		const embedText = interaction.options.getString('embed');

		// Validate numeric ID
		if (!/^\d{5,}$/.test(userId)) {
			return interaction.reply({ content: '❌ آیدی عددی نامعتبر است.', flags: MessageFlags.Ephemeral });
		}

		try {
			const user = await interaction.client.users.fetch(userId);
			if (!user) {
				return interaction.reply({ content: '❌ کاربر یافت نشد.', flags: MessageFlags.Ephemeral });
			}

			const payload = {};
			if (plainText) payload.content = plainText;
			if (embedText) {
				const embed = new EmbedBuilder()
					.setDescription(embedText)
					.setColor('#3498db')
					.setTimestamp();
				payload.embeds = [embed];
			}

			if (!payload.content && !payload.embeds) {
				return interaction.reply({ content: 'ℹ️ لطفاً حداقل یکی از گزینه‌های "message" یا "embed" را وارد کنید.', flags: MessageFlags.Ephemeral });
			}

			await user.send(payload);
			return interaction.reply({ content: `✅ پیام به DM کاربر <@${userId}> ارسال شد.`, flags: MessageFlags.Ephemeral });
		} catch (e) {
			return interaction.reply({ content: '❌ ارسال پیام به DM ممکن نشد (کاربر شاید DM را بسته باشد).', flags: MessageFlags.Ephemeral });
		}
	}
};

// Auto Reaction Command
const autoreactionCommand = {
    data: new SlashCommandBuilder()
        .setName('autoreaction')
        .setDescription('تنظیم اتو ریاکشن برای چنل یا یک پیام')
        .addSubcommand(sub =>
            sub.setName('channel')
                .setDescription('اتو ریاکشن برای تمام پیام‌های یک چنل از این به بعد')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('ایموجی/استیکر برای ریاکشن خودکار')
                        .setRequired(true))
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('چنل هدف (اختیاری، پیش‌فرض همین چنل)')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('message')
                .setDescription('اتو ریاکشن فقط برای یک پیام مشخص')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('ایموجی/استیکر')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message_link')
                        .setDescription('لینک پیام هدف')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('حذف اتو ریاکشن‌ها از یک چنل')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('چنل هدف (اختیاری، پیش‌فرض همین چنل)')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('ایموجی خاص برای حذف (اختیاری)')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'channel') {
            const emojiInput = interaction.options.getString('emoji');
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

            // init map
            if (!interaction.client.autoReactions) {
                interaction.client.autoReactions = new Map(); // channelId => Set(emojiKeys)
            }

            let emojiKey = null;
            const customEmojiMatch = emojiInput.match(/^<a?:\w+:(\d+)>$/);
            if (customEmojiMatch) {
                emojiKey = customEmojiMatch[1];
            } else {
                emojiKey = emojiInput;
            }

            const set = interaction.client.autoReactions.get(targetChannel.id) || new Set();
            set.add(emojiKey);
            interaction.client.autoReactions.set(targetChannel.id, set);

            const embed = new EmbedBuilder()
                .setTitle('✅ اتو ریاکشن فعال شد')
                .setDescription(`از این به بعد روی تمام پیام‌های چنل <#${targetChannel.id}> ایموجی ${emojiInput} به صورت خودکار اضافه می‌شود.`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        if (sub === 'message') {
            const emojiInput = interaction.options.getString('emoji');
            const messageLink = interaction.options.getString('message_link');

            const linkRegex = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
            const match = messageLink.match(linkRegex);
            if (!match) {
                return interaction.reply({ content: '❌ لینک پیام نامعتبر است.', flags: MessageFlags.Ephemeral });
            }
            const [, guildId, channelId, messageId] = match;
            if (guildId !== interaction.guild.id) {
                return interaction.reply({ content: '❌ لینک مربوط به این سرور نیست.', flags: MessageFlags.Ephemeral });
            }

            try {
                const channel = await interaction.client.channels.fetch(channelId);
                const message = await channel.messages.fetch(messageId);

                let emojiKey = null;
                const customEmojiMatch = emojiInput.match(/^<a?:\w+:(\d+)>$/);
                if (customEmojiMatch) {
                    emojiKey = customEmojiMatch[1];
                    await message.react(emojiKey);
                } else {
                    emojiKey = emojiInput;
                    await message.react(emojiKey);
                }

                if (!interaction.client.autoReactSingle) {
                    interaction.client.autoReactSingle = new Map(); // messageId => Set(emojiKeys)
                }
                const set = interaction.client.autoReactSingle.get(messageId) || new Set();
                set.add(emojiKey);
                interaction.client.autoReactSingle.set(messageId, set);

                const embed = new EmbedBuilder()
                    .setTitle('✅ اتو ریاکشن برای یک پیام تنظیم شد')
                    .setDescription(`روی پیام [لینک](${messageLink}) ایموجی ${emojiInput} اضافه شد و در صورت حذف، دوباره اعمال می‌شود.`)
                    .setColor('#2ecc71')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch (e) {
                await interaction.reply({ content: '❌ دسترسی به پیام یا ریاکت ممکن نشد.', flags: MessageFlags.Ephemeral });
            }
        }

        if (sub === 'disable') {
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
            const emojiInput = interaction.options.getString('emoji');

            if (!interaction.client.autoReactions) {
                interaction.client.autoReactions = new Map();
            }

            // Try both the channel and its parent (in case of thread)
            const candidateIds = [targetChannel.id];
            if (targetChannel.parentId) candidateIds.push(targetChannel.parentId);

            const foundId = candidateIds.find(id => {
                const s = interaction.client.autoReactions.get(id);
                return s && s.size > 0;
            });

            if (!foundId) {
                return interaction.reply({ content: 'ℹ️ اتو ریاکشن فعالی برای این چنل وجود ندارد.', flags: MessageFlags.Ephemeral });
            }

            if (emojiInput) {
                let emojiKey = null;
                const customEmojiMatch = emojiInput.match(/^<a?:\w+:(\d+)>$/);
                if (customEmojiMatch) {
                    emojiKey = customEmojiMatch[1];
                } else {
                    emojiKey = emojiInput;
                }
                const set = interaction.client.autoReactions.get(foundId);
                set.delete(emojiKey);
                if (set.size === 0) {
                    interaction.client.autoReactions.delete(foundId);
                } else {
                    interaction.client.autoReactions.set(foundId, set);
                }

                const embed = new EmbedBuilder()
                    .setTitle('✅ اتو ریاکشن حذف شد')
                    .setDescription(`ایموجی ${emojiInput} از فهرست اتو ریاکشن‌های چنل <#${foundId}> حذف شد.`)
                    .setColor('#e67e22')
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            // Remove all for the found channel id
            interaction.client.autoReactions.delete(foundId);

            const embed = new EmbedBuilder()
                .setTitle('✅ اتو ریاکشن‌های این چنل غیرفعال شد')
                .setDescription(`تمام ایموجی‌های اتو ریاکشن برای چنل <#${foundId}> حذف شدند.`)
                .setColor('#e74c3c')
                .setTimestamp();
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};


module.exports = {
    avatarCommand,
    banCommand,
    kickCommand,
    clearCommand,
    warnCommand,
    warn2Command,
    warnlistCommand,
    clearwarnsCommand,
    deletemessageuserCommand,
    remindCommand,
    weatherCommand,
    timeCommand,
    sayCommand,
    serverinfoCommand,
    userinfoCommand,
    helpCommand,
    reactionroleCommand,
	autoreactionCommand,
	sendCommand
};
