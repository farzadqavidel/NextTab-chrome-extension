#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config({ silent: true });

// Check if required environment variables are set
const requiredEnvVars = ['DISCORD_BOT_TOKEN', 'GUILD_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('\n❌ Missing environment variables:', missingVars.join(', '));
    console.error('👉 Create a .env file with these keys, e.g.:');
    console.error('   DISCORD_BOT_TOKEN=your_token_here');
    console.error('   GUILD_ID=your_guild_id_here');
    console.error('You can run: npm run setup:env');
    process.exit(1);
}

// Start the API server (website)
const apiServer = spawn('node', ['api.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

// Start the Discord bot
const botProcess = spawn('node', ['bot.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

// Handle API server errors
apiServer.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
    botProcess.kill();
    process.exit(1);
});

apiServer.on('close', (code) => {
    console.log(`\n🔄 API server exited with code ${code}`);
    botProcess.kill();
    process.exit(code);
});

// Handle bot errors
botProcess.on('error', (error) => {
    console.error('❌ Failed to start Discord bot:', error);
    apiServer.kill();
    process.exit(1);
});

botProcess.on('close', (code) => {
    console.log(`\n🔄 Discord bot exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    apiServer.kill('SIGINT');
    botProcess.kill('SIGINT');
});

// Wait a moment for processes to start
setTimeout(() => {
    // Silent startup
}, 2000);
