# WhatsApp Message Forwarder Bot

A robust WhatsApp bot that automatically forwards all incoming messages to a specified number. Built with Node.js and optimized for server deployment with PM2 on aaPanel/Ubuntu environments.

## 🚀 Features

- **Auto Message Forwarding**: Forwards all incoming messages to a designated WhatsApp number
- **Session Persistence**: Maintains WhatsApp Web session across restarts
- **Group & Personal Chat Support**: Handles both group messages and personal chats
- **Rich Message Formatting**: Includes sender info, timestamp, and chat type
- **Server Optimized**: Configured for headless server environments
- **PM2 Integration**: Production-ready with PM2 process manager
- **Auto Reconnection**: Automatic reconnection on disconnects
- **Chrome/Chromium Compatible**: Works with system Chrome installations

## 📋 Prerequisites

- Node.js (v14 or higher)
- PM2 process manager
- Chrome/Chromium browser
- Ubuntu/Debian server (recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd whatsapp-message-forwarder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Set up Chrome dependencies (Ubuntu/Debian)**
   ```bash
   sudo apt-get update
   sudo apt-get install -y chromium-browser libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
   ```

## ⚙️ Configuration

Edit the `FORWARD_TO_NUMBER` in `index.js` to your target WhatsApp number:

```javascript
const FORWARD_TO_NUMBER = '628986600541'; // Replace with your number (international format without +)
```

## 🚀 Usage

### Development Mode
```bash
node index.js
```

### Production Mode with PM2
```bash
# Start the bot
pm2 start ecosystem.config.js

# Monitor logs
pm2 logs waclone

# Check status
pm2 status

# Restart
pm2 restart waclone

# Stop
pm2 stop waclone
```

### First Time Setup

1. Start the bot
2. Check QR code in logs: `cat logs/qrcode.txt`
3. Scan QR code with WhatsApp mobile app
4. Bot will authenticate and start forwarding messages

## 🔧 Troubleshooting

### Chrome Issues on Server

If you encounter Chrome-related errors, run the fix script:

```bash
bash fix-chrome.sh
```

This script will:
- Clean up Chrome singleton locks
- Set proper environment variables
- Create XDG settings wrapper
- Set correct permissions

### Common Issues

1. **LocalAuth Error**: Make sure you're not using custom `userDataDir` with LocalAuth
2. **Permission Denied**: Run `chmod +x fix-chrome.sh` and execute it
3. **QR Code Not Showing**: Check `logs/qrcode.txt` for the QR code text
4. **Chrome Crashes**: Install required system dependencies

## 📁 Project Structure

```
├── index.js                 # Main bot application
├── ecosystem.config.js      # PM2 configuration
├── package.json            # Node.js dependencies
├── fix-chrome.sh           # Chrome troubleshooting script
├── .env                    # Environment variables
├── logs/                   # Application logs
│   ├── app.log            # Application logs
│   ├── qrcode.txt         # QR code for authentication
│   └── pm2-*.log          # PM2 logs
├── .auth_whatsapp/        # WhatsApp session data
└── node_modules/          # Dependencies
```

## 🔒 Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=production
DISPLAY=:99
XDG_RUNTIME_DIR=/tmp
CHROME_PATH=/usr/bin/chromium-browser
```

## 📊 Message Format

Forwarded messages include:

- 👤 **Sender Name**: Contact name or phone number
- 📞 **Phone Number**: Sender's phone number
- 💬 **Chat Type**: Group name or "Personal Chat"
- 🕒 **Timestamp**: Message received time
- 📝 **Message Content**: Original message text

Example:
```
📱 *Pesan WhatsApp Baru*

👤 *Dari:* John Doe
📞 *Nomor:* 628123456789
💬 *Grup:* Personal Chat
🕒 *Waktu:* 23/05/2025 22:06:34

📝 *Pesan:*
Hello, how are you?
```

## 🔄 Auto Reconnection

The bot includes automatic reconnection logic:
- Attempts to reconnect up to 3 times
- 5-second delay between reconnection attempts
- Graceful handling of authentication failures

## 📈 Monitoring

### PM2 Monitoring
```bash
# Real-time logs
pm2 logs waclone --lines 50

# Monitor resources
pm2 monit

# Detailed info
pm2 info waclone
```

### Log Files
- `logs/app.log` - Application events and errors
- `logs/pm2-out.log` - PM2 stdout logs
- `logs/pm2-error.log` - PM2 error logs

## 🛡️ Security Considerations

- Keep your `.env` file secure and never commit it
- Regularly update dependencies: `npm audit fix`
- Monitor logs for suspicious activities
- Use firewall rules to protect your server
- Consider rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This bot is for educational and personal use only. Make sure to comply with WhatsApp's Terms of Service and your local laws. The developers are not responsible for any misuse of this software.

## 🐛 Issues

If you encounter any issues, please check:

1. [Troubleshooting section](#-troubleshooting)
2. Existing [GitHub Issues](../../issues)
3. Create a new issue with detailed information

## 📞 Support

For support and questions:
- 📧 Open an issue on GitHub
- 📖 Check the documentation above
- 🔧 Run the troubleshooting script

---

**Made with ❤️ for WhatsApp automation**