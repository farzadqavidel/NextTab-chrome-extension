const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetch } = require('undici');

// Constants for special roles
const ROLE_ID_VIPCLB = '1403512560262709339';
const ROLE_ID_CLB = '1400907778473852995';

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
                .setColor('#ff0000')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: '❌ خطا در پاک کردن پیام‌ها!', flags: MessageFlags.Ephemeral });
        }
    }
};

// VipCLB Command: add role and set nickname "𝐕 | 𝐂𝐋𝐁 | {name}"
const vipclbCommand = {
    data: new SlashCommandBuilder()
        .setName('vipclb')
        .setDescription('دادن رول VIP CLB و تغییر نام کاربر')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('name')
                .setDescription('نام دلخواه برای نمایش')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const nameInput = (interaction.options.getString('name') || '').trim();

        // Permissions check for invoker
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) ||
            !interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: '❌ شما مجوز لازم (Manage Roles/Nicknames) را ندارید.', flags: MessageFlags.Ephemeral });
        }
        // Bot permissions
        const me = interaction.guild.members.me;
        if (!me || !me.permissions.has(PermissionFlagsBits.ManageRoles) || !me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: '❌ ربات مجوز Manage Roles/Nicknames ندارد.', flags: MessageFlags.Ephemeral });
        }

        // Validate name and compose nickname
        const prefix = '𝐕 | 𝐂𝐋𝐁 | ';
        const desired = `${prefix}${nameInput}`;
        if (!nameInput) {
            return interaction.reply({ content: '❌ لطفاً یک نام معتبر وارد کنید.', flags: MessageFlags.Ephemeral });
        }
        if (desired.length > 32) {
            return interaction.reply({ content: `❌ نام خیلی طولانی است. حداکثر 32 کاراکتر. (فعلی: ${desired.length})`, flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            if (!member) return interaction.reply({ content: '❌ کاربر در سرور یافت نشد.', flags: MessageFlags.Ephemeral });

            // Check hierarchy for role and member
            const role = interaction.guild.roles.cache.get(ROLE_ID_VIPCLB) || await interaction.guild.roles.fetch(ROLE_ID_VIPCLB).catch(() => null);
            if (!role) return interaction.reply({ content: '❌ رول VIP CLB یافت نشد.', flags: MessageFlags.Ephemeral });
            if (me.roles.highest.comparePositionTo(role) <= 0) {
                return interaction.reply({ content: '❌ ربات قادر به مدیریت این رول نیست (موقعیت رول بالاتر است).', flags: MessageFlags.Ephemeral });
            }
            if (!member.manageable) {
                return interaction.reply({ content: '❌ امکان تغییر نام این کاربر وجود ندارد (نقش/سلسله‌مراتب).', flags: MessageFlags.Ephemeral });
            }

            // Grant role if not present
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role, 'VipCLB command: grant role');
            }
            // Set nickname
            if (member.displayName !== desired) {
                await member.setNickname(desired, 'VipCLB command: set nickname');
            }

            const embed = new EmbedBuilder()
                .setTitle('Role Dade Shod Va Name Update Shod ❗')
                .setDescription(`Be Karbar${member} Role <@&${role.id}> Dade Shod !\n\ 🆕New Name : ${desired} `)
                .setColor('#000000')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            await interaction.reply({ content: '❌ خطا در انجام عملیات (Role/Nick).', flags: MessageFlags.Ephemeral });
        }
    }
};

// CLB Command: add role and set nickname "𝐂𝐋𝐁 | {name}"
const clbCommand = {
    data: new SlashCommandBuilder()
        .setName('clb')
        .setDescription('دادن رول CLB و تغییر نام کاربر')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('کاربر هدف')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('name')
                .setDescription('نام دلخواه برای نمایش')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const nameInput = (interaction.options.getString('name') || '').trim();

        // Permissions check for invoker
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles) ||
            !interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: '❌ شما مجوز لازم (Manage Roles/Nicknames) را ندارید.', flags: MessageFlags.Ephemeral });
        }
        // Bot permissions
        const me = interaction.guild.members.me;
        if (!me || !me.permissions.has(PermissionFlagsBits.ManageRoles) || !me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: '❌ ربات مجوز Manage Roles/Nicknames ندارد.', flags: MessageFlags.Ephemeral });
        }

        // Validate name and compose nickname
        const prefix = '𝐂𝐋𝐁 | ';
        const desired = `${prefix}${nameInput}`;
        if (!nameInput) {
            return interaction.reply({ content: '❌ لطفاً یک نام معتبر وارد کنید.', flags: MessageFlags.Ephemeral });
        }
        if (desired.length > 32) {
            return interaction.reply({ content: `❌ نام خیلی طولانی است. حداکثر 32 کاراکتر. (فعلی: ${desired.length})`, flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            if (!member) return interaction.reply({ content: '❌ کاربر در سرور یافت نشد.', flags: MessageFlags.Ephemeral });

            // Check hierarchy for role and member
            const role = interaction.guild.roles.cache.get(ROLE_ID_CLB) || await interaction.guild.roles.fetch(ROLE_ID_CLB).catch(() => null);
            if (!role) return interaction.reply({ content: '❌ رول CLB یافت نشد.', flags: MessageFlags.Ephemeral });
            if (me.roles.highest.comparePositionTo(role) <= 0) {
                return interaction.reply({ content: '❌ ربات قادر به مدیریت این رول نیست (موقعیت رول بالاتر است).', flags: MessageFlags.Ephemeral });
            }
            if (!member.manageable) {
                return interaction.reply({ content: '❌ امکان تغییر نام این کاربر وجود ندارد (نقش/سلسله‌مراتب).', flags: MessageFlags.Ephemeral });
            }

            // Grant role if not present
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role, 'CLB command: grant role');
            }
            // Set nickname
            if (member.displayName !== desired) {
                await member.setNickname(desired, 'CLB command: set nickname');
            }

            const embed = new EmbedBuilder()
                .setTitle('Role Dade Shod Va Name Update Shod ❗')
                .setDescription(`Be Karbar${member} Role <@&${role.id}> Dade Shod !\n\ 🆕New Name : ${desired} `)
                .setColor('#000000')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            await interaction.reply({ content: '❌ خطا در انجام عملیات (Role/Nick).', flags: MessageFlags.Ephemeral });
        }
    }
};

// Remind Command (removed by user request)

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

// ForTest Command حذف شد بر اساس درخواست کاربر
// (بدنه‌ی قدیمی fortest به طور کامل پاک شده است)

// (translate command removed by user request)

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
        
        // Get roles as mentions, excluding @everyone
        let rolesText = 'نامشخص';
        if (member) {
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id) // Exclude @everyone
                .map(role => role.toString()) // Convert to mention format
                .join(' ');
            rolesText = roles || 'بدون رول';
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`اطلاعات ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🏷️ نام کاربری', value: user.tag, inline: true },
                { name: '🆔 آیدی', value: user.id, inline: true },
                { name: '📅 تاریخ عضویت', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'نامشخص', inline: true },
                { name: '📅 تاریخ ایجاد اکانت', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 رول‌ها', value: rolesText, inline: false }
            )
            .setColor('#000000')
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
            option.setName('embadout')
                .setDescription('متن خارج از امباد (می‌تواند کاربر و everyone را تگ کند)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('تایتل امباد')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('discription')
                .setDescription('متن داخل امباد')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('picture')
                .setDescription('عکس داخل امباد (URL)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('foter')
                .setDescription('فوتر امباد')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('رنگ امبد (یک گزینه را انتخاب کنید)')
                .setRequired(false)
                .addChoices(
                    { name: 'نئون سبز', value: '#00ff88' },
                    { name: 'آبی روشن', value: '#00b8ff' },
                    { name: 'بنفش', value: '#8c4bff' },
                    { name: 'قرمز', value: '#ff4d6d' },
                    { name: 'نارنجی', value: '#ffaa00' },
                    { name: 'سفید', value: '#ffffff' },
                    { name: 'تیره', value: '#2f3136' }
                )),
    
    async execute(interaction) {
        const embadout = interaction.options.getString('embadout');
        const title = interaction.options.getString('title');
        const discription = interaction.options.getString('discription');
        const picture = interaction.options.getString('picture');
        const foter = interaction.options.getString('foter');
        const color = interaction.options.getString('color');

        if (!embadout && !title && !discription && !picture && !foter && !color) {
            return interaction.reply({ content: '❌ حداقل یکی از فیلدها را وارد کنید.', flags: MessageFlags.Ephemeral });
        }

        // Validate image URL if provided
        let validImageUrl = null;
        if (picture) {
            try {
                // Try to create a URL object to validate
                const url = new URL(picture);
                // Check if it's http or https
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    validImageUrl = picture;
                } else {
                    return interaction.reply({ content: '❌ آدرس عکس باید یک URL معتبر (http:// یا https://) باشد.', flags: MessageFlags.Ephemeral });
                }
            } catch (e) {
                // If URL parsing fails, it's not a valid URL
                return interaction.reply({ content: '❌ آدرس عکس باید یک URL معتبر باشد (مثلاً https://example.com/image.png).', flags: MessageFlags.Ephemeral });
            }
        }

        const embeds = [];
        let contentToSend = embadout || '';
        
        // اگر امباد وجود دارد، آن را بساز
        if (title || discription || validImageUrl || foter || color) {
            const embed = new EmbedBuilder()
                .setColor(color || '#636060')
                .setTimestamp();
            
            if (title) embed.setTitle(title);
            if (discription) embed.setDescription(discription);
            if (validImageUrl) embed.setImage(validImageUrl);
            if (foter) embed.setFooter({ text: foter });
            
            embeds.push(embed);
        }

        // ارسال پیام در چنل با اجازه تگ کردن کاربران و everyone
        await interaction.channel.send({ 
            content: contentToSend || undefined, 
            embeds: embeds.length > 0 ? embeds : undefined, 
            allowedMentions: { parse: ['users', 'everyone', 'roles'] } 
        });
        
        // پاسخ به interaction
        await interaction.reply({ 
            content: '✅ پیام با موفقیت ارسال شد.', 
            flags: MessageFlags.Ephemeral 
        });
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
				.setDescription('ارسال پیام به DM یک کاربر')
				.addStringOption(opt =>
					opt.setName('user_id')
						.setDescription('آیدی عددی یا نام کاربری (مثلاً 123456789012345678 یا Farzad132)')
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

		const userInput = interaction.options.getString('user_id');
		const plainText = interaction.options.getString('message');
		const embedText = interaction.options.getString('embed');

		let user = null;

		try {
			// بررسی اینکه آیا ورودی آیدی عددی است یا نام کاربری
			if (/^\d{5,}$/.test(userInput)) {
				// آیدی عددی
				user = await interaction.client.users.fetch(userInput);
			} else {
				// نام کاربری - حذف @ از ابتدا اگر وجود داشته باشد
				const username = userInput.startsWith('@') ? userInput.slice(1) : userInput;
				
				// جستجو در اعضای سرور
				const guild = interaction.guild;
				
				// اگر عضو سرور است
				const member = guild.members.cache.find(m => 
					!m.user.bot && (
						m.user.username.toLowerCase() === username.toLowerCase() ||
						m.user.globalName?.toLowerCase() === username.toLowerCase() ||
						m.displayName.toLowerCase() === username.toLowerCase()
					)
				);

				if (member) {
					user = member.user;
				} else {
					// اگر در cache نبود، جستجو در کل اعضا
					await guild.members.fetch({ limit: 1000 }).catch(() => {});
					const foundMember = guild.members.cache.find(m => 
						!m.user.bot && (
							m.user.username.toLowerCase() === username.toLowerCase() ||
							m.user.globalName?.toLowerCase() === username.toLowerCase() ||
							m.displayName.toLowerCase() === username.toLowerCase()
						)
					);
					
					if (foundMember) {
						user = foundMember.user;
					} else {
						return interaction.reply({ content: `❌ کاربر با نام "${username}" در سرور یافت نشد. لطفاً آیدی عددی را وارد کنید یا از نام کاربری دقیق استفاده کنید.`, flags: MessageFlags.Ephemeral });
					}
				}
			}

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
			return interaction.reply({ content: `✅ پیام به DM کاربر ${user.tag} (<@${user.id}>) ارسال شد.`, flags: MessageFlags.Ephemeral });
		} catch (e) {
			if (e.code === 50007) {
				return interaction.reply({ content: '❌ ارسال پیام به DM ممکن نشد (کاربر DM را بسته است).', flags: MessageFlags.Ephemeral });
			}
			return interaction.reply({ content: `❌ خطا: ${e.message || 'ارسال پیام به DM ممکن نشد'}`, flags: MessageFlags.Ephemeral });
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

// Ban Info Command
const baninfoCommand = {
    data: new SlashCommandBuilder()
        .setName('baninfo')
        .setDescription('جستجوی اطلاعات بن با شماره')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('شماره بن (مثلاً 14)')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const number = interaction.options.getInteger('number');
        const BAN_CHANNEL_ID = '1431664611761061961';

        try {
            // Fetch the channel
            let channel = interaction.client.channels.cache.get(BAN_CHANNEL_ID);
            if (!channel) {
                channel = await interaction.client.channels.fetch(BAN_CHANNEL_ID).catch(() => null);
            }

            if (!channel) {
                return interaction.reply({ 
                    content: '❌ چنل مورد نظر یافت نشد.' 
                });
            }

            // Check if bot can read message history
            const botMember = channel.guild?.members?.me;
            if (botMember) {
                const permissions = channel.permissionsFor(botMember);
                if (!permissions || !permissions.has('ReadMessageHistory')) {
                    return interaction.reply({ 
                        content: '❌ ربات دسترسی خواندن تاریخچه پیام‌ها را ندارد.' 
                    });
                }
            }

            // Search for messages containing "Number={number}"
            const searchPattern = new RegExp(`Number\\s*=\\s*${number}\\b`, 'i');
            let foundMessage = null;
            let lastId = undefined;
            let searchedCount = 0;
            const MAX_SEARCH = 5000; // Limit search to avoid rate limits

            // Search through messages
            while (!foundMessage && searchedCount < MAX_SEARCH) {
                const batch = await channel.messages.fetch({ 
                    limit: 100, 
                    before: lastId 
                }).catch(() => null);

                if (!batch || batch.size === 0) break;

                searchedCount += batch.size;

                // Check each message for the pattern
                for (const [, msg] of batch) {
                    if (msg.content && searchPattern.test(msg.content)) {
                        foundMessage = msg;
                        break;
                    }
                }

                if (foundMessage) break;

                lastId = batch.last()?.id;
                if (!lastId) break;
            }

            if (!foundMessage) {
                return interaction.reply({ 
                    content: `❌ فرمی با شماره ${number} یافت نشد.` 
                });
            }

            // Extract and format the form content
            const formContent = foundMessage.content;
            const messageLink = `https://discord.com/channels/${channel.guild.id}/${channel.id}/${foundMessage.id}`;

            // Reply with the form content and link
            const replyContent = formContent.length > 1900 
                ? formContent.slice(0, 1897) + '...' 
                : formContent;
            
            await interaction.reply({ 
                content: `${replyContent}\n\n🔗 [Link Payam](${messageLink})`
            });

        } catch (error) {
            console.error('❌ Error in baninfo command:', error);
            await interaction.reply({ 
                content: '❌ خطا در جستجوی اطلاعات بن.' 
            });
        }
    }
};

// Roast Command (removed by user request)

// Feedback Command
const feedbackCommand = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('ارسال بازخورد به ادمین‌ها'),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('💬 ارسال بازخورد')
                .setDescription('اگر پیشنهادی، انتقادی یا نظری دارید، لطفاً آن را با تیم ما به اشتراک بگذارید.')
                .setColor('#3498db')
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('feedback_button')
                .setLabel('ارسال بازخورد')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💬');

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({
                embeds: [embed],
                components: [row],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('❌ Error in feedback command:', error);
            await interaction.reply({
                content: '❌ خطا در اجرای دستور.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

// Bug Report Command
const bugCommand = {
    data: new SlashCommandBuilder()
        .setName('bug')
        .setDescription('گزارش باگ'),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('🐛 گزارش باگ')
                .setDescription('اگر موردی یا مشکلی دارید، لطفاً به تیم ما گزارش دهید.')
                .setColor('#e74c3c')
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('bug_report_button')
                .setLabel('گزارش باگ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🐛');

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({ 
                embeds: [embed],
                components: [row],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('❌ Error in bug command:', error);
            await interaction.reply({ 
                content: '❌ خطا در اجرای دستور.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};

module.exports = {
    clearCommand,
    sayCommand,
    userinfoCommand,
    reactionroleCommand,
	autoreactionCommand,
	sendCommand,
    vipclbCommand,
    clbCommand,
    baninfoCommand,
    feedbackCommand,
    bugCommand
};
