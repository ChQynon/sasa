const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');

// Platform-specific handlers
const handlers = {
  // TikTok videos
  async tiktok(url) {
    try {
      // Попытка обработать через youtube-dl
      return await youtubeDl(url, {
        dumpSingleJson: true,
        noCheckCertificate: true,
        noWarnings: true,
        preferFreeFormats: true,
        format: 'best[ext=mp4]/best' // Лучшее качество со звуком
      });
    } catch (error) {
      console.log("Ошибка при обработке TikTok с youtube-dl, пробуем альтернативный метод:", error.message);
      
      // Если это не видео, а фото, youtube-dl не сможет его обработать
      if (error.stderr && error.stderr.includes("Unsupported URL") && url.includes("photo")) {
        throw new Error("Ссылка ведет на фотографию, а не на видео. Бот поддерживает только загрузку видео.");
      }
      
      throw error;
    }
  },
  
  // Douyin videos (Chinese version of TikTok)
  async douyin(url) {
    try {
      return await youtubeDl(url, {
        dumpSingleJson: true,
        noCheckCertificate: true,
        noWarnings: true,
        preferFreeFormats: true,
        format: 'best[ext=mp4]/best' // Лучшее качество со звуком
      });
    } catch (error) {
      console.log("Ошибка при обработке Douyin:", error.message);
      
      // Если это не видео, а фото
      if (error.stderr && error.stderr.includes("Unsupported URL") && url.includes("photo")) {
        throw new Error("Ссылка ведет на фотографию, а не на видео. Бот поддерживает только загрузку видео.");
      }
      
      throw error;
    }
  },
  
  // Weibo videos
  async weibo(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best' // Лучшее качество со звуком
    });
  },
  
  // RedNote/XiaoHongShu videos
  async rednote(url) {
    // Если это короткая ссылка xhslink, сначала получаем настоящий URL через редирект
    if (url.includes('xhslink.com')) {
      try {
        console.log("Обрабатываем короткую ссылку XiaoHongShu:", url);
        const response = await axios.head(url, {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400
        });
        
        if (response.headers.location) {
          url = response.headers.location;
          console.log("Получен полный URL после редиректа:", url);
        }
      } catch (error) {
        if (error.response && error.response.headers && error.response.headers.location) {
          url = error.response.headers.location;
          console.log("Получен полный URL из ошибки редиректа:", url);
        } else {
          console.error("Не удалось получить настоящий URL из короткой ссылки:", error);
        }
      }
    }
    
    // Теперь обрабатываем полный URL
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best' // Лучшее качество со звуком
    });
  },
  
  // Instagram videos
  async instagram(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best', // Лучшее качество со звуком
      addHeader: [
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'cookie:sessionid=SOME_SESSION_ID' // Примечание: Может потребоваться добавить действительный cookie-файл сеанса Instagram
      ]
    });
  },
  
  // YouTube videos
  async youtube(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' // Лучшее видео+аудио или просто лучшее
    });
  },
  
  // Kuaishou videos
  async kuaishou(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best' // Лучшее качество со звуком
    });
  }
};

// Generic downloader function that selects the appropriate handler
async function downloadFromPlatform(url, platform) {
  if (!handlers[platform]) {
    throw new Error(`Нет обработчика для платформы: ${platform}`);
  }
  
  try {
    return await handlers[platform](url);
  } catch (error) {
    console.error(`Ошибка в обработчике ${platform}:`, error);
    throw error;
  }
}

module.exports = {
  downloadFromPlatform,
  handlers
}; 