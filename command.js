const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetch } = require('undici');


// Clear Command
const clearCommand = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Pak Kardan Payam Ha')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Tedad Payam Hayi Ke Mikhai Pak Koni (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ Shoma Mojaz Modiriat Payam Ha Ra Nadarid!', flags: MessageFlags.Ephemeral });
        }
        
        try {
			const messages = await interaction.channel.bulkDelete(amount, true);
			const deletedCount = messages?.size || 0;
			// Send moderation log to the specified channel
			try {
				const LOG_CHANNEL_ID = '1402073143354589296';
				const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
				if (logChannel && logChannel.send) {
					const text = `🧹 ${interaction.user.tag} Tedad ${deletedCount} Payam Ra Dar Channel <#${interaction.channel.id}> Pak Kard`;
					await logChannel.send({ content: text });
				}
			} catch (_) {}
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Payam Ha Pak Shodand')
				.setDescription(`**Tedad Payam Haye Pak Shode:** ${messages.size}\n**Tavassot:** ${interaction.user.tag}`)
                .setColor('#ff0000')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: '❌ Khata Dar Pak Kardan Payam Ha!', flags: MessageFlags.Ephemeral });
        }
    }
};


// Remind Command (removed by user request)

// Weather Command (Open-Meteo)
const weatherCommand = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Vaziyat Ab Va Hava Baraye Yek Shahr')
                .addStringOption(o => o.setName('city').setDescription('Name Shahr (Masalan Tehran)').setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fa`);
            const geo = await geoRes.json();
            const loc = geo?.results?.[0];
            if (!loc) return interaction.reply({ content: '❌ Shahr Yaft Nashod.', flags: MessageFlags.Ephemeral });

            const lat = loc.latitude, lon = loc.longitude;
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
            const w = await wRes.json();
            const c = w?.current;
            if (!c) return interaction.reply({ content: '❌ Daryaft Etelaat Ab Va Hava Momken Nashod.', flags: MessageFlags.Ephemeral });

            const embed = new EmbedBuilder()
                .setTitle(`🌤️ Ab Va Hava: ${loc.name}${loc.country ? ' - ' + loc.country : ''}`)
                .addFields(
                    { name: 'Dama', value: `${c.temperature_2m}°C`, inline: true },
                    { name: 'Rotubat', value: `${c.relative_humidity_2m}%`, inline: true },
                    { name: 'Sorat Bad', value: `${c.wind_speed_10m} m/s`, inline: true }
                )
                .setColor('#3498db')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            await interaction.reply({ content: '❌ Khata Dar Daryaft Ab Va Hava.', flags: MessageFlags.Ephemeral });
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
        .setDescription('Etelaat Karbar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Karbar Mored Nazar')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        // Get roles as mentions, excluding @everyone
        let rolesText = 'Nam Nashas';
        if (member) {
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id) // Exclude @everyone
                .map(role => role.toString()) // Convert to mention format
                .join(' ');
            rolesText = roles || 'Bedoone Role';
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`Etelaat ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🏷️ Name Karbari', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Tarikh Ozviyat', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Nam Nashas', inline: true },
                { name: '📅 Tarikh Ijad Account', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 Role Ha', value: rolesText, inline: false }
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
        .setDescription('Ersal Payam Hamrah Ba Embed Safarshi')
        .addStringOption(option =>
            option.setName('embadout')
                .setDescription('Matn Kharej Az Embed (Mitavad Karbar Va Everyone Ra Tag Konad)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title Embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('discription')
                .setDescription('Matn Dakhel Embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('picture')
                .setDescription('Aks Dakhel Embed (URL)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('foter')
                .setDescription('Footer Embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Rang Embed (Yek Gozine Ra Entekhab Konid)')
                .setRequired(false)
                .addChoices(
                    { name: 'Neon Sabz', value: '#00ff88' },
                    { name: 'Abi Roshan', value: '#00b8ff' },
                    { name: 'Banafsh', value: '#8c4bff' },
                    { name: 'Ghermez', value: '#ff4d6d' },
                    { name: 'Naranji', value: '#ffaa00' },
                    { name: 'Sefid', value: '#ffffff' },
                    { name: 'Tireh', value: '#2f3136' }
                )),
    
    async execute(interaction) {
        const embadout = interaction.options.getString('embadout');
        const title = interaction.options.getString('title');
        const discription = interaction.options.getString('discription');
        const picture = interaction.options.getString('picture');
        const foter = interaction.options.getString('foter');
        const color = interaction.options.getString('color');

        if (!embadout && !title && !discription && !picture && !foter && !color) {
            return interaction.reply({ content: '❌ Had Aghal Yeki Az Field Ha Ra Vared Konid.', flags: MessageFlags.Ephemeral });
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
                    return interaction.reply({ content: '❌ Address Aks Bayad Yek URL Motabar (http:// Ya https://) Bashad.', flags: MessageFlags.Ephemeral });
                }
            } catch (e) {
                // If URL parsing fails, it's not a valid URL
                return interaction.reply({ content: '❌ Address Aks Bayad Yek URL Motabar Bashad (Masalan https://example.com/image.png).', flags: MessageFlags.Ephemeral });
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
            content: '✅ Payam Ba Movafaghiyat Ersal Shod.', 
            flags: MessageFlags.Ephemeral 
        });
    }
};

// Reaction Role Command
const reactionroleCommand = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Tanzim Naghsh Dehi Ba Reaction Ruye Yek Payam')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji/Sticker Baraye Reaction (Masalan 😀 Ya <:name:id>)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Naghshey Ke Ba Reaction Dade Mishavad')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message_link')
                .setDescription('Link Payam Hadaf (Right click > Copy Link)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const emojiInput = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');
        const messageLink = interaction.options.getString('message_link');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '❌ Robot Mojaz Manage Roles Nadarad.', flags: MessageFlags.Ephemeral });
        }

        // Parse message link: https://discord.com/channels/{guildId}/{channelId}/{messageId}
        const linkRegex = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
        const match = messageLink.match(linkRegex);
        if (!match) {
            return interaction.reply({ content: '❌ Link Payam Namotabar Ast.', flags: MessageFlags.Ephemeral });
        }
        const [, guildId, channelId, messageId] = match;
        if (guildId !== interaction.guild.id) {
            return interaction.reply({ content: '❌ Link Marboot Be In Server Nist.', flags: MessageFlags.Ephemeral });
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
                .setTitle('✅ Reaction Role Tanzim Shod')
                .setDescription(`Be Payam [Link](${messageLink}) Emoji ${emojiInput} Ezafe Shod.
Ba Zadan In Reaction, Naghs <@&${role.id}> Dade Mishavad.`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            await interaction.reply({ content: '❌ Khata Dar Tanzim Reaction Role Ya Dastrasi Be Payam.', flags: MessageFlags.Ephemeral });
        }
    }
};

// Send Command (/send dm)
const sendCommand = {
	data: new SlashCommandBuilder()
		.setName('send')
		.setDescription('Ersal Payam Khosoosi')
		.addSubcommand(sub =>
			sub.setName('dm')
				.setDescription('Ersal Payam Be DM Yek Karbar')
				.addStringOption(opt =>
					opt.setName('user_id')
						.setDescription('ID Adadi Ya Name Karbari (Masalan 123456789012345678 Ya Farzad132)')
						.setRequired(true))
				.addStringOption(opt =>
					opt.setName('message')
						.setDescription('Matn Payam Mamooli (Ekhtiari)')
						.setRequired(false))
				.addStringOption(opt =>
					opt.setName('embed')
						.setDescription('Matn Dakhel Embed (Ekhtiari)')
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
						return interaction.reply({ content: `❌ Karbar Ba Name "${username}" Dar Server Yaft Nashod. Lotfan ID Adadi Ra Vared Konid Ya Az Name Karbari Daghigh Estefade Konid.`, flags: MessageFlags.Ephemeral });
					}
				}
			}

			if (!user) {
				return interaction.reply({ content: '❌ Karbar Yaft Nashod.', flags: MessageFlags.Ephemeral });
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
				return interaction.reply({ content: 'ℹ️ Lotfan Had Aghal Yeki Az Gozine Haye "message" Ya "embed" Ra Vared Konid.', flags: MessageFlags.Ephemeral });
			}

			await user.send(payload);
			return interaction.reply({ content: `✅ Payam Be DM Karbar ${user.tag} (<@${user.id}>) Ersal Shod.`, flags: MessageFlags.Ephemeral });
		} catch (e) {
			if (e.code === 50007) {
				return interaction.reply({ content: '❌ Ersal Payam Be DM Momken Nashod (Karbar DM Ra Basteh Ast).', flags: MessageFlags.Ephemeral });
			}
			return interaction.reply({ content: `❌ Khata: ${e.message || 'Ersal Payam Be DM Momken Nashod'}`, flags: MessageFlags.Ephemeral });
		}
	}
};

// Auto Reaction Command
const autoreactionCommand = {
    data: new SlashCommandBuilder()
        .setName('autoreaction')
        .setDescription('Tanzim Auto Reaction Baraye Channel Ya Yek Payam')
        .addSubcommand(sub =>
            sub.setName('channel')
                .setDescription('Auto Reaction Baraye Tamame Payam Haye Yek Channel Az In Be Bad')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('Emoji/Sticker Baraye Reaction Khodkar')
                        .setRequired(true))
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('چنل هدف (اختیاری، پیش‌فرض همین چنل)')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('message')
                .setDescription('Auto Reaction Faghat Baraye Yek Payam Moshakhas')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('ایموجی/استیکر')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message_link')
                        .setDescription('Link Payam Hadaf')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('Hazf Auto Reaction Ha Az Yek Channel')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('چنل هدف (اختیاری، پیش‌فرض همین چنل)')
                        .setRequired(false))
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('Emoji Khass Baraye Hazf (Ekhtiari)')
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
                .setTitle('✅ Auto Reaction Faal Shod')
                .setDescription(`Az In Be Bad Ruye Tamame Payam Haye Channel <#${targetChannel.id}> Emoji ${emojiInput} Be Sorat Khodkar Ezafe Mishavad.`)
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
                return interaction.reply({ content: '❌ Link Payam Namotabar Ast.', flags: MessageFlags.Ephemeral });
            }
            const [, guildId, channelId, messageId] = match;
            if (guildId !== interaction.guild.id) {
                return interaction.reply({ content: '❌ Link Marboot Be In Server Nist.', flags: MessageFlags.Ephemeral });
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
                .setTitle('✅ Auto Reaction Baraye Yek Payam Tanzim Shod')
                .setDescription(`Ruye Payam [Link](${messageLink}) Emoji ${emojiInput} Ezafe Shod Va Dar Sorat Hazf, Dobare Emal Mishavad.`)
                    .setColor('#2ecc71')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch (e) {
                await interaction.reply({ content: '❌ Dastrasi Be Payam Ya React Momken Nashod.', flags: MessageFlags.Ephemeral });
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
                return interaction.reply({ content: 'ℹ️ Auto Reaction Faali Baraye In Channel Vojod Nadarad.', flags: MessageFlags.Ephemeral });
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
                    .setTitle('✅ Auto Reaction Hazf Shod')
                    .setDescription(`Emoji ${emojiInput} Az Fehrest Auto Reaction Haye Channel <#${foundId}> Hazf Shod.`)
                    .setColor('#e67e22')
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            // Remove all for the found channel id
            interaction.client.autoReactions.delete(foundId);

            const embed = new EmbedBuilder()
                .setTitle('✅ Auto Reaction Haye In Channel Gheyr Faal Shod')
                .setDescription(`Tamame Emoji Haye Auto Reaction Baraye Channel <#${foundId}> Hazf Shodand.`)
                .setColor('#e74c3c')
                .setTimestamp();
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};


// Roast Command (removed by user request)

// Feedback Command
const feedbackCommand = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Ersal Bazkhord Be Admin Ha'),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('💬 Ersal Bazkhord')
                .setDescription('Agar Pishnahadi, Enteghadi Ya Nazari Darid, Lotfan An Ra Ba Team Ma Be Eshtrak Begzarid.')
                .setColor('#3498db')
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('feedback_button')
                .setLabel('Ersal Bazkhord')
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
                content: '❌ Khata Dar Ejraye Dastor.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

// Bug Report Command
const bugCommand = {
    data: new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Gozaresh Bagh'),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('🐛 Gozaresh Bagh')
                .setDescription('Agar Moredi Ya Moshkeli Darid, Lotfan Be Team Ma Gozaresh Dahid.')
                .setColor('#e74c3c')
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('bug_report_button')
                .setLabel('Gozaresh Bagh')
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
                content: '❌ Khata Dar Ejraye Dastor.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};

// Set Staff Command
const setstaffCommand = {
    data: new SlashCommandBuilder()
        .setName('setstaff')
        .setDescription('Tanzim Staff: Taghir Name Va Ezafe Kardan Role')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Karbar Mored Nazar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Name Jadid Baraye Karbar')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        // بررسی دسترسی ادمین
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '❌ Shoma Mojaz Estefade Az In Dastor Ra Nadarid!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const targetUser = interaction.options.getUser('user');
        const newNickname = interaction.options.getString('nickname');

        try {
            // دریافت member از guild
            const member = await interaction.guild.members.fetch(targetUser.id);
            
            // بررسی اینکه bot می‌تواند nickname را تغییر دهد
            if (!member.manageable) {
                return interaction.reply({ 
                    content: '❌ Nemitanam Name In Karbar Ra Taghir Daham (Role Bot Bala Tar Ast).', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // تغییر نام کاربر
            await member.setNickname(newNickname, `Set staff by ${interaction.user.tag}`);

            // اضافه کردن رول
            const staffRoleId = '1452988034877362298';
            const staffRole = interaction.guild.roles.cache.get(staffRoleId);
            
            if (!staffRole) {
                return interaction.reply({ 
                    content: '❌ Role Staff Peyda Nashod!', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // بررسی اینکه کاربر قبلاً این رول را دارد یا نه
            if (!member.roles.cache.has(staffRoleId)) {
                await member.roles.add(staffRole, `Set staff by ${interaction.user.tag}`);
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Staff Tanzim Shod')
                .setDescription(`**Karbar:** ${targetUser}\n**Name Jadid:** ${newNickname}\n**Role:** ${staffRole}`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error in setstaff command:', error);
            await interaction.reply({ 
                content: `❌ Khata Dar Tanzim Staff: ${error.message || 'Khata Noshakhas'}`,
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};

// Archive Command
const archiveCommand = {
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('Archive Kardan Yek Payam')
        .addStringOption(option =>
            option.setName('message_link')
                .setDescription('Link Payam (Right click > Copy Link)')
                .setRequired(true)),
    async execute(interaction) {
        const messageLink = interaction.options.getString('message_link');
        
        if (!messageLink) {
            return interaction.reply({ 
                content: '❌ Lotfan Link Payam Ra Vared Konid!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // Parse message link: https://discord.com/channels/{guildId}/{channelId}/{messageId}
        const linkRegex = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
        const match = messageLink.match(linkRegex);
        
        if (!match) {
            return interaction.reply({ 
                content: '❌ Link Payam Namotabar Ast. Lotfan Link Motabar Vared Konid.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const [, guildId, channelId, messageId] = match;
        
        // بررسی اینکه لینک مربوط به همین سرور است
        if (guildId !== interaction.guild.id) {
            return interaction.reply({ 
                content: '❌ Link Payam Marboot Be In Server Nist!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            // دریافت چنل و پیام
            const channel = await interaction.client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);

            // دریافت متن پیام
            const messageContent = message.content || '(Payam Faghat Attachment Darad)';
            
            // چنل مقصد برای ارسال فرم
            const archiveChannelId = '1454447751923499181';
            const archiveChannel = await interaction.client.channels.fetch(archiveChannelId).catch(() => null);
            
            if (!archiveChannel) {
                return interaction.reply({ 
                    content: '❌ Channel Archive Peyda Nashod!', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // ساخت پیام با فرمت درخواستی (فقط یکبار منشن کاربر)
            const archiveContent = `\`\`\`\n${messageContent}\n\`\`\`\n${message.author}`;

            // ارسال پیام به چنل مشخص شده
            await archiveChannel.send(archiveContent);

            // پاسخ به کاربر
            await interaction.reply({ 
                content: 'Form Archive Shod ✅', 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            console.error('❌ Error in archive command:', error);
            
            let errorMessage = '❌ Khata Dar Archive Kardan Payam!';
            if (error.code === 10008) {
                errorMessage = '❌ Payam Peyda Nashod (Shayad Pak Shode Ast).';
            } else if (error.code === 50001) {
                errorMessage = '❌ Dastrasi Be Channel Mored Nazar Nadaram.';
            }
            
            await interaction.reply({ 
                content: errorMessage, 
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
    feedbackCommand,
    bugCommand,
    setstaffCommand,
    archiveCommand
};
