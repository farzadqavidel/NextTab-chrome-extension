#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎮 CLUBS Website Setup\n');
console.log('This script will help you configure your Discord bot integration.\n');

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function setup() {
    try {
        console.log('📝 Please provide the following information:\n');
        
        const botToken = await askQuestion('Discord Bot Token: ');
        const guildId = await askQuestion('Discord Guild ID: ');
        
        if (!botToken || botToken === 'your_discord_bot_token_here') {
            console.log('\n❌ Please provide a valid Discord bot token.');
            console.log('   You can get this from: https://discord.com/developers/applications');
            process.exit(1);
        }
        
        if (!guildId || guildId === 'your_discord_guild_id_here') {
            console.log('\n❌ Please provide a valid Discord guild ID.');
            console.log('   You can get this by right-clicking your server name and selecting "Copy Server ID"');
            process.exit(1);
        }
        
        // Create .env file
        const envContent = `# Discord Bot Configuration
DISCORD_BOT_TOKEN=${botToken}
GUILD_ID=${guildId}

# Server Configuration
PORT=3000
NODE_ENV=development`;
        
        fs.writeFileSync('.env', envContent);
        
        console.log('\n✅ Configuration saved successfully!');
        console.log('\n🚀 You can now start the server with: npm start');
        console.log('🌐 Website will be available at: http://localhost:3000');
        console.log('\n📋 Make sure your Discord bot has the following permissions:');
        console.log('   - View Channels');
        console.log('   - Read Message History');
        console.log('   - View Server Insights');
        console.log('   - Read Members');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

setup();
