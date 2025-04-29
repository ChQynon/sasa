# Бот для скачивания видео из социальных сетей

Телеграм-бот, который скачивает видео с различных платформ социальных сетей:
- TikTok
- Douyin
- Weibo
- RedNote (XiaoHongShu)
- Instagram
- YouTube
- Kuaishou

## Требования

- Node.js (v14 или новее)
- npm
- [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec) зависимости
- Токен бота Telegram (получить от [@BotFather](https://t.me/BotFather))

## Настройка

1. Клонировать репозиторий:
```
git clone <url-репозитория>
cd social-media-downloader-bot
```

2. Установить зависимости:
```
npm install
```

3. Создать файл `.env` в корневой директории со следующим содержимым:
```
BOT_TOKEN=7914542986:AAHGQNRy8QJRG8lyS7boPah9MmjFiAQr3w0
DOWNLOAD_PATH=./downloads
```

4. Установить youtube-dl (необходимо для загрузки видео):
   - На Windows:
     ```
     npm i -g youtube-dl-exec
     ```
   - На Linux/macOS:
     ```
     sudo apt-get install python3
     pip3 install youtube-dl
     ```

## Запуск бота

### Локально

```
npm start
```

Для разработки с автоматическим перезапуском:
```
npm run dev
```

### Развертывание на Vercel

1. Создайте проект на Vercel и подключите ваш репозиторий.
2. Настройте переменные окружения в Vercel:
   - `BOT_TOKEN`: Ваш токен бота Telegram
   - `NODE_ENV`: production
   - `DOWNLOAD_PATH`: /tmp/downloads

3. После развертывания установите вебхук для вашего бота:
```
curl -F "url=https://your-vercel-app.vercel.app/api/webhook" https://api.telegram.org/bot7914542986:AAHGQNRy8QJRG8lyS7boPah9MmjFiAQr3w0/setWebhook
```

## Использование

1. Начните чат с вашим ботом в Telegram.
2. Отправьте `/start` для просмотра приветственного сообщения.
3. Отправьте любую поддерживаемую ссылку на социальную сеть боту.
4. Бот скачает видео и отправит его вам обратно.

## Как это работает

Бот использует youtube-dl для извлечения загружаемых URL видео из различных платформ социальных сетей. Он обрабатывает разные платформы с помощью специализированных обработчиков для обеспечения максимальной совместимости.

## Ограничения

- Некоторые платформы могут требовать аутентификации или иметь ограничения по скорости
- Большие видео могут не загружаться из-за ограничений размера файла Telegram
- Некоторые платформы могут изменять свои API или структуры, что требует обновления бота

## Лицензия

MIT 