require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const FORWARD_TO_NUMBER = 'YOUR_NUMBER';

const AUTH_DIR = '.auth_whatsapp';
const SESSION_DIR = path.join(process.cwd(), AUTH_DIR);
const LOG_DIR = path.join(process.cwd(), 'logs');

fs.ensureDirSync(SESSION_DIR);
fs.ensureDirSync(LOG_DIR);

const writeLog = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync(path.join(LOG_DIR, 'app.log'), logMessage);
};

const saveQRToFile = (qr) => {
    fs.writeFileSync(path.join(LOG_DIR, 'qrcode.txt'), qr);
    writeLog('QR Code tersimpan di file logs/qrcode.txt');
};

const findChromePath = () => {
    const execSync = require('child_process').execSync;
    const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable'
    ];
    
    for (const chromePathToCheck of possiblePaths) {
        try {
            execSync(`test -x ${chromePathToCheck}`, { stdio: 'ignore' });
            writeLog(`Chrome ditemukan di: ${chromePathToCheck}`);
            return chromePathToCheck;
        } catch (error) {
            continue;
        }
    }
    
    writeLog('Chrome tidak ditemukan, menggunakan Puppeteer built-in');
    return undefined;
};

const cleanupChromeProcesses = () => {
    try {
        const execSync = require('child_process').execSync;
        execSync('pkill -f chrome || true', { stdio: 'ignore' });
        execSync('pkill -f chromium || true', { stdio: 'ignore' });
        
        const homeDir = os.homedir();
        const lockPaths = [
            `${homeDir}/snap/chromium/common/chromium/SingletonLock`,
            `${homeDir}/.config/chromium/SingletonLock`,
            `${homeDir}/.config/google-chrome/SingletonLock`
        ];
        
        lockPaths.forEach(lockPath => {
            try {
                if (fs.existsSync(lockPath)) {
                    fs.unlinkSync(lockPath);
                    writeLog(`Removed lock file: ${lockPath}`);
                }
            } catch (err) {
                // Ignore errors
            }
        });
    } catch (error) {
        writeLog(`Cleanup warning: ${error.message}`);
    }
};

const chromePath = findChromePath();
cleanupChromeProcesses();

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'whatsapp-bot',
        dataPath: SESSION_DIR
    }),
    puppeteer: {
        headless: true,
        executablePath: chromePath || process.env.CHROME_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-translate',
            '--disable-plugins',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-ipc-flooding-protection',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--remote-debugging-port=0'
        ]
    },
    qrTimeoutMs: 0,
    authTimeoutMs: 0,
    restartOnAuthFail: true
});

let connectionState = {
    isReady: false,
    isConnected: false,
    reconnectCount: 0
};

client.on('qr', (qr) => {
    writeLog('QR Code received, generating...');
    qrcode.generate(qr, { small: true });
    saveQRToFile(qr);
});

client.on('authenticated', () => {
    writeLog('Client authenticated successfully!');
    
    if (fs.existsSync(SESSION_DIR)) {
        const files = fs.readdirSync(SESSION_DIR);
        writeLog(`Session files verified: ${files.length} files found`);
    }
});

client.on('ready', () => {
    writeLog('Client is ready! Session tersimpan.');
    connectionState.isReady = true;
    connectionState.isConnected = true;
    connectionState.reconnectCount = 0;
});

client.on('message', async (message) => {
    try {
        if (message.from === `${FORWARD_TO_NUMBER}@c.us`) {
            return;
        }

        const contact = await message.getContact();
        const chat = await message.getChat();
        
        let forwardMessage = `📱 *Pesan WhatsApp Baru*\n\n`;
        forwardMessage += `👤 *Dari:* ${contact.name || contact.pushname || 'Unknown'}\n`;
        forwardMessage += `📞 *Nomor:* ${contact.number}\n`;
        forwardMessage += `💬 *Grup:* ${chat.isGroup ? chat.name : 'Personal Chat'}\n`;
        forwardMessage += `🕒 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`;
        forwardMessage += `📝 *Pesan:*\n${message.body}`;

        await client.sendMessage(`${FORWARD_TO_NUMBER}@c.us`, forwardMessage);
        writeLog('Message forwarded successfully');
        
    } catch (error) {
        writeLog(`Error forwarding message: ${error.message}`);
    }
});

client.on('disconnected', (reason) => {
    writeLog(`Client disconnected: ${reason}`);
    connectionState.isReady = false;
    connectionState.isConnected = false;
    connectionState.reconnectCount++;
    
    if (connectionState.reconnectCount < 3) {
        writeLog(`Attempting to reconnect... (${connectionState.reconnectCount}/3)`);
        setTimeout(() => {
            client.initialize();
        }, 5000);
    } else {
        writeLog('Max reconnection attempts reached');
    }
});

client.on('auth_failure', (msg) => {
    writeLog(`Authentication failed: ${msg}`);
    connectionState.isReady = false;
    connectionState.isConnected = false;
});

process.on('SIGINT', async () => {
    writeLog('Shutting down gracefully...');
    try {
        if (connectionState.isReady) {
            await client.destroy();
            writeLog('Client destroyed successfully');
        }
        cleanupChromeProcesses();
        process.exit(0);
    } catch (error) {
        writeLog(`Error during shutdown: ${error.message}`);
        cleanupChromeProcesses();
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    writeLog('Received SIGTERM, shutting down gracefully...');
    try {
        if (connectionState.isReady) {
            await client.destroy();
            writeLog('Client destroyed successfully');
        }
        cleanupChromeProcesses();
        process.exit(0);
    } catch (error) {
        writeLog(`Error during shutdown: ${error.message}`);
        cleanupChromeProcesses();
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    writeLog(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
    writeLog(`Uncaught Exception: ${error}`);
    cleanupChromeProcesses();
    if (connectionState.isReady) {
        client.destroy().finally(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

writeLog('Starting WhatsApp client...');
client.initialize();
