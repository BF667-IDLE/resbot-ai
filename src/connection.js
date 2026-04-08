import './cleanLogger.js';

import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import config from '../config.js';
import { handleMessageUpsert } from './handlers/message.js';
import { handleConnectionUpdate } from './handlers/connection.js';
import { handleContactsUpdate } from './handlers/contact.js';

const logger = pino({ level: 'silent' });

async function connectToWhatsApp() {
  if (global.sock && global.sock.user && global.sock.ws && global.sock.ws.readyState === 1) {
    console.log(chalk.yellow('⚠️ Bot sudah terkoneksi dan aktif. Tidak membuat koneksi baru.'));
    return global.sock;
  }

  const sessionDir = path.join(process.cwd(), 'session');

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
  });

  global.sock = sock;

  if (!sock.authState.creds.registered && config.type_connection.toLowerCase() == 'pairing') {
    const phoneNumber = config.phone_number_bot;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(4000);
    const code = await sock.requestPairingCode(phoneNumber.trim());
    console.log(chalk.blue('PHONE NUMBER: '), chalk.yellow(phoneNumber));
    console.log(chalk.blue('CODE PAIRING: '), chalk.yellow(code.match(/.{1,4}/g).join('-')));
  }

  sock.ev.on('creds.update', saveCreds);

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  try {
    fs.chmodSync(sessionDir, 0o755);
    fs.readdir(sessionDir, (err, files) => {
      if (err) {
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(sessionDir, file);
        fs.chmod(filePath, 0o644, (err) => {
          if (err) {
            console.error('Error changing file permissions:', err);
          }
        });
      });
    });
  } catch (err) {
    // Ignore permission errors on systems that don't support it (like some Windows envs might complain, though user is on Windows)
  }

  // Handlers
  sock.ev.on('contacts.update', handleContactsUpdate);

  sock.ev.on('messages.upsert', async (m) => {
    await handleMessageUpsert(sock, m);
  });

  sock.ev.on('connection.update', async (update) => {
    await handleConnectionUpdate(update, sock, connectToWhatsApp);
  });

  return sock;
}

export { connectToWhatsApp };
