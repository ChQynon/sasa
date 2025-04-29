const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');

// Platform-specific handlers
const handlers = {
  // TikTok videos
  async tiktok(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best'
    });
  },
  
  // Douyin videos (Chinese version of TikTok)
  async douyin(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best'
    });
  },
  
  // Weibo videos
  async weibo(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best'
    });
  },
  
  // RedNote/XiaoHongShu videos
  async rednote(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best'
    });
  },
  
  // Instagram videos
  async instagram(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best',
      addHeader: [
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'cookie:sessionid=SOME_SESSION_ID' // Note: You might need to add a valid Instagram session cookie
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
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
    });
  },
  
  // Kuaishou videos
  async kuaishou(url) {
    return await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificate: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'best[ext=mp4]/best'
    });
  }
};

// Generic downloader function that selects the appropriate handler
async function downloadFromPlatform(url, platform) {
  if (!handlers[platform]) {
    throw new Error(`No handler for platform: ${platform}`);
  }
  
  try {
    return await handlers[platform](url);
  } catch (error) {
    console.error(`Error in ${platform} handler:`, error);
    throw error;
  }
}

module.exports = {
  downloadFromPlatform,
  handlers
}; 