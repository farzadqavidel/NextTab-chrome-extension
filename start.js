#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// مسیر ریشه پروژه
const cwd = __dirname;

// اجرای وب‌سرور (api.js)
const apiServer = spawn('node', ['api.js'], {
    cwd,
    stdio: 'inherit'
});

// اجرای بات (bot.js)
const botProcess = spawn('node', ['bot.js'], {
    cwd,
    stdio: 'inherit'
});

// مدیریت خطاهای وب‌سرور
apiServer.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
    botProcess.kill();
    process.exit(1);
});

apiServer.on('close', (code) => {
    console.log('\n🔄 API server exited');
    botProcess.kill();
    process.exit(code);
});

// مدیریت خطاهای بات
botProcess.on('error', (error) => {
    console.error('❌ Failed to start Discord bot:', error);
    apiServer.kill();
    process.exit(1);
});

botProcess.on('close', (code) => {
    console.log('\n🔄 Discord bot exited');
    apiServer.kill();
    process.exit(code);
});

// برای Ctrl+C هر دو پروسه بسته شوند
process.on('SIGINT', () => {
    apiServer.kill('SIGINT');
    botProcess.kill('SIGINT');
});


