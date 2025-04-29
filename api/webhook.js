// Обработчик вебхуков для Vercel
const bot = require('../index');

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Получаем обновление от Telegram
      const update = req.body;
      
      // Обрабатываем входящие обновления
      if (update && update.message) {
        await bot.processUpdate(update);
        res.status(200).json({ ok: true });
      } else {
        // Если это не обновление, возвращаем ОК
        res.status(200).json({ ok: true, info: 'Это эндпоинт для вебхуков Telegram' });
      }
    } else {
      // Для GET запросов возвращаем информацию
      res.status(200).json({ 
        ok: true,
        info: 'Это эндпоинт для вебхуков Telegram бота загрузки видео из социальных сетей'
      });
    }
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
}; 