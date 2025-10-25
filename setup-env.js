#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎮 CLUBS Website & Bot Environment Setup\n');

const envTemplate = `# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
GUILD_ID=your_discord_guild_id_here

# Server Configuration
PORT=3000
HOST=localhost

# Website Configuration
WEBSITE_TITLE=CLUBS - تیم گیمینگ
WEBSITE_DESCRIPTION=تیم گیمینگ حرفه‌ای - آماده برای CS2
DISCORD_INVITE=https://discord.gg/95ubwScKzH
`;

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setupEnvironment() {
    try {
        // Check if .env already exists
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const overwrite = await askQuestion('⚠️  .env file already exists. Do you want to overwrite it? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ Setup cancelled.');
                rl.close();
                return;
            }
        }

        console.log('📝 Please provide the following information:\n');

        const discordToken = await askQuestion('🤖 Discord Bot Token: ');
        const guildId = await askQuestion('🏠 Discord Guild ID: ');
        const port = await askQuestion('🌐 Port (default: 3000): ') || '3000';
        const host = await askQuestion('🏠 Host (default: localhost): ') || 'localhost';

        // Validate inputs
        if (!discordToken || discordToken === 'your_discord_bot_token_here') {
            console.log('❌ Please provide a valid Discord Bot Token.');
            rl.close();
            return;
        }

        if (!guildId || guildId === 'your_discord_guild_id_here') {
            console.log('❌ Please provide a valid Discord Guild ID.');
            rl.close();
            return;
        }

        // Create .env content
        const envContent = `# Discord Bot Configuration
DISCORD_BOT_TOKEN=${discordToken}
GUILD_ID=${guildId}

# Server Configuration
PORT=${port}
HOST=${host}

# Website Configuration
WEBSITE_TITLE=CLUBS - تیم گیمینگ
WEBSITE_DESCRIPTION=تیم گیمینگ حرفه‌ای - آماده برای CS2
DISCORD_INVITE=https://discord.gg/95ubwScKzH
`;

        // Write .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log('\n✅ .env file created successfully!');
        console.log('🚀 You can now run: npm start');
        console.log('\n📋 Your configuration:');
        console.log(`   Bot Token: ${discordToken.substring(0, 10)}...`);
        console.log(`   Guild ID: ${guildId}`);
        console.log(`   Port: ${port}`);
        console.log(`   Host: ${host}`);

    } catch (error) {
        console.error('❌ Error setting up environment:', error.message);
    } finally {
        rl.close();
    }
}

// Run setup
setupEnvironment();
