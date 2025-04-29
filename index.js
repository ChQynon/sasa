require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { downloadFromPlatform } = require('./platform-handlers');

// Создание директории для загрузок, если она не существует
const downloadPath = process.env.DOWNLOAD_PATH || './downloads';
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath, { recursive: true });
}

// Инициализация бота
const token = process.env.BOT_TOKEN || '7914542986:AAHGQNRy8QJRG8lyS7boPah9MmjFiAQr3w0';
let bot;

// Режим работы бота зависит от окружения
if (process.env.NODE_ENV === 'production') {
  // Для Vercel - используем webhook
  bot = new TelegramBot(token);
  bot.setWebHook(`${process.env.VERCEL_URL}/api/webhook`);
  console.log('Бот запущен в режиме webhook');
} else {
  // Для локальной разработки - используем long polling
  bot = new TelegramBot(token, { polling: true });
  console.log('Бот запущен в режиме polling');
}

// Карта для отслеживания загрузок пользователей
const userDownloads = new Map();

// Приветственное сообщение и команда помощи
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Добро пожаловать в бот для скачивания видео из социальных сетей!
    
Отправьте мне ссылку с любой из этих платформ, чтобы скачать видео:
- TikTok
- Douyin
- Weibo
- RedNote (XiaoHongShu)
- Instagram
- YouTube
- Kuaishou

Наберите /help, чтобы увидеть это сообщение снова.`
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Отправьте мне ссылку с любой из этих платформ, чтобы скачать видео:
- TikTok
- Douyin
- Weibo
- RedNote (XiaoHongShu)
- Instagram
- YouTube
- Kuaishou

Просто вставьте URL, и я скачаю для вас видео!`
  );
});

// Шаблоны URL для распознавания платформ
const URL_PATTERNS = {
  tiktok: /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/i,
  douyin: /https?:\/\/(www\.)?(douyin\.com|iesdouyin\.com)\/.+/i,
  weibo: /https?:\/\/(www\.)?weibo\.com\/.+/i,
  rednote: /https?:\/\/(www\.)?(xiaohongshu\.com|xhs\.com)\/.+/i,
  instagram: /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+/i,
  youtube: /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  kuaishou: /https?:\/\/(www\.)?(kuaishou\.com|ksh\.com)\/.+/i
};

// Обработка любого сообщения с URL
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text || '';
  
  if (messageText.startsWith('/')) return; // Пропускаем команды
  
  const urls = extractUrls(messageText);
  if (urls.length === 0) return;
  
  for (const url of urls) {
    const platform = identifyPlatform(url);
    if (!platform) {
      bot.sendMessage(chatId, `Извините, я не смог определить платформу для этого URL: ${url}`);
      continue;
    }
    
    try {
      const statusMessage = await bot.sendMessage(chatId, `Скачиваю видео из ${platform}...`);
      await downloadVideo(url, platform, chatId, statusMessage.message_id);
    } catch (error) {
      console.error(`Ошибка при обработке ${url}:`, error);
      bot.sendMessage(chatId, `Извините, я не смог скачать видео с ${url}. Ошибка: ${error.message}`);
    }
  }
});

// Извлечение URL из текста
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Определение платформы по URL
function identifyPlatform(url) {
  for (const [platform, regex] of Object.entries(URL_PATTERNS)) {
    if (regex.test(url)) {
      return platform;
    }
  }
  return null;
}

// Загрузка видео с платформы
async function downloadVideo(url, platform, chatId, statusMessageId) {
  const userId = chatId.toString();
  const timestamp = Date.now();
  const filename = `${platform}_${timestamp}.mp4`;
  const outputPath = path.join(downloadPath, filename);
  
  try {
    // Используем обработчики для конкретных платформ
    await bot.editMessageText(`Обрабатываю URL из ${platform}...`, {
      chat_id: chatId,
      message_id: statusMessageId
    });
    
    // Получаем информацию о видео с помощью обработчика платформы
    const videoInfo = await downloadFromPlatform(url, platform);
    
    // Загружаем видеофайл
    await bot.editMessageText(`Скачиваю видео из ${platform}...`, {
      chat_id: chatId,
      message_id: statusMessageId
    });
    
    // Для результатов youtube-dl мы можем получить URL лучшего формата
    let videoUrl;
    if (videoInfo.formats && videoInfo.formats.length > 0) {
      // Сортируем форматы по качеству и выбираем лучшее видео со звуком
      const formats = videoInfo.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
      formats.sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
      videoUrl = formats[0].url;
    } else if (videoInfo.url) {
      videoUrl = videoInfo.url;
    } else {
      throw new Error('Не найден URL для скачивания видео');
    }
    
    // Загружаем файл с помощью axios
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    await bot.editMessageText(`Видео скачано, отправляю...`, {
      chat_id: chatId,
      message_id: statusMessageId
    });
    
    // Отправляем видеофайл
    await bot.sendVideo(chatId, outputPath, {
      caption: videoInfo.title ? `${videoInfo.title} (из ${platform})` : `Скачано из ${platform}`
    });
    
    // Удаляем сообщение об обработке
    await bot.deleteMessage(chatId, statusMessageId);
    
    // Очищаем файл
    fs.unlinkSync(outputPath);
    
  } catch (error) {
    console.error(`Ошибка при скачивании видео из ${platform}:`, error);
    await bot.editMessageText(`Не удалось скачать из ${platform}: ${error.message}`, {
      chat_id: chatId,
      message_id: statusMessageId
    });
    throw error;
  }
}

// Экспортируем бот для использования в API роутах Vercel
module.exports = bot; 