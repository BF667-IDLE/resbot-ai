import config from '../../config.js';
import chalk from 'chalk';
import serializeMessage from '../../lib/serializeMessage.js';
import { processMessage } from '../../lib/ai.js';
import { writeLog } from '../../lib/log.js';
import { logWithTime } from '../../lib/utils.js';
import { addUser, getUser } from '../../lib/users.js';

const lastMessageTime = {};

async function handleMessageUpsert(sock, m) {
  //console.log(chalk.greenBright('logging message upsert...'));

  try {
    const result = serializeMessage(m, sock);
    if (!result) {
      // console.log(JSON.stringify(m, null, 2))
      return;
    }

    const { isGroup, content, messageType, message, isQuoted, pushName, sender, remoteJid } =
      result;

    // console.log(
    //   chalk.gray('────────────────────────────────'),
    //   `\n${chalk.blueBright('📩 MESSAGE LOG')}`,
    //   `\n${chalk.cyan('From      :')} ${chalk.white(pushName || '-')}`,
    //   `\n${chalk.cyan('Sender ID :')} ${chalk.white(sender)}`,
    //   `\n${chalk.cyan('Chat ID   :')} ${chalk.white(remoteJid)}`,
    //   `\n${chalk.cyan('Group     :')} ${isGroup ? chalk.green('YES') : chalk.red('NO')}`,
    //   `\n${chalk.cyan('Type      :')} ${chalk.yellow(messageType)}`,
    //   `\n${chalk.cyan('Quoted    :')} ${isQuoted ? chalk.green('YES') : chalk.red('NO')}`,
    //   `\n${chalk.cyan('Content   :')} ${chalk.white(
    //     typeof content === 'string' ? content : '[object]',
    //   )}`,
    //   `\n${chalk.gray('────────────────────────────────')}`,
    // );

    if (remoteJid == 'status@broadcast') {
      console.log(chalk.yellowBright('Status message skipped'));
      return false;
    }

    // Handle Destination
    const destination = config.bot_destination.toLowerCase();

    if ((isGroup && destination === 'private') || (!isGroup && destination === 'group')) {
      const reason = isGroup ? 'Only Chat (Private)' : 'Only Group';

      return console.log(chalk.yellowBright(`[SKIP] ${reason} → Message ignored`));
    }

    let truncatedContent = content;
    if (content.length > 10) {
      truncatedContent = content.substring(0, 10) + '...';
    }

    const currentTime = Date.now();
    if (
      content &&
      lastMessageTime[remoteJid] &&
      currentTime - lastMessageTime[remoteJid] < config.rate_limit
    ) {
      console.log(chalk.redBright(`Rate limit : ${truncatedContent} - ${remoteJid}`));
      return;
    }
    if (content) {
      lastMessageTime[remoteJid] = currentTime;
      logWithTime(pushName, truncatedContent);
      // console.log(chalk.greenBright(`${pushName} : ${truncatedContent}`));
    }

    // Log File
    writeLog('INFO', `${remoteJid}: ${content}`);

    // Cek Users

    const userReady = getUser(sender);
    if (!userReady) {
      addUser(sender, -1);
    }

    /* --------------------- Send Message ---------------------- */
    try {
      await processMessage(
        content,
        sock,
        sender,
        remoteJid,
        message,
        messageType,
        pushName,
        isQuoted,
      );
    } catch (error) {
      console.error('Terjadi kesalahan saat memproses pesan:', error);
    }
  } catch (error) {
    console.log(chalk.redBright(`Error dalam message upsert: ${error.message}`));
  }
}

export { handleMessageUpsert };
