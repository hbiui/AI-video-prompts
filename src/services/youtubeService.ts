
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YoutubeVideo {
  id: string;
  title: string;
  views: string;
  author: string;
  thumbnail: string;
  url: string;
}

export async function fetchTrendingShorts(apiKey?: string): Promise<YoutubeVideo[]> {
  const finalApiKey = apiKey || API_KEY;
  
  if (!finalApiKey) {
    console.warn('YOUTUBE_API_KEY is not defined.');
    return [];
  }

  try {
    // 1. Search for popular Shorts
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=10&order=viewCount&q=%23Shorts&type=video&videoDuration=short&key=${finalApiKey}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      throw new Error(errorData.error?.message || 'Failed to fetch trending videos');
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 2. Get detailed video statistics (view count)
    const detailResponse = await fetch(
      `${BASE_URL}/videos?part=statistics,snippet&id=${videoIds}&key=${finalApiKey}`
    );

    if (!detailResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const detailData = await detailResponse.json();

    return detailData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      views: formatViews(item.statistics.viewCount),
      author: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/shorts/${item.id}`
    }));
  } catch (error) {
    console.error('Error fetching YouTube trending:', error);
    throw error;
  }
}

function formatViews(viewCount: string): string {
  const views = parseInt(viewCount, 10);
  if (isNaN(views)) return '0';
  
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}
