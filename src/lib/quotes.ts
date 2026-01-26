/**
 * Fetch random inspirational quotes based on language
 */

interface QuoteResponse {
  quote: string;
  author?: string;
}

/**
 * Fetch random English quote - using fallback quotes only
 * (API calls removed due to CORS/SSL issues)
 */
export const fetchEnglishQuote = async (): Promise<string> => {
  // Fallback quotes - using only local quotes to avoid API issues
  const fallbackQuotes = [
    'The only way to do great work is to love what you do.',
    'Success is the sum of small efforts repeated day in and day out.',
    'Focus on being productive, not busy.',
    'The future depends on what you do today.',
    'Stay focused and keep moving forward.',
    'The secret of getting ahead is getting started.',
    'Don\'t watch the clock; do what it does. Keep going.',
    'You don\'t have to be great to start, but you have to start to be great.',
    'The way to get started is to quit talking and begin doing.',
    'Innovation distinguishes between a leader and a follower.',
    'Life is what happens to you while you\'re busy making other plans.',
    'The future belongs to those who believe in the beauty of their dreams.',
    'It is during our darkest moments that we must focus to see the light.',
    'The only impossible journey is the one you never begin.',
    'In the middle of difficulty lies opportunity.',
  ];

  // Return random quote from fallback list
  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
};

/**
 * Fetch random Korean quote from Korean Advice API
 */
export const fetchKoreanQuote = async (): Promise<string> => {
  // Fallback quotes in Korean
  const fallbackQuotes = [
    '작은 노력의 반복이 큰 성공을 만든다.',
    '집중하고 계속 나아가세요.',
    '오늘의 노력이 내일의 성과를 만든다.',
    '한 걸음씩 꾸준히 나아가면 목표에 도달할 수 있다.',
    '성공은 작은 노력을 매일 반복하는 것이다.',
    '시작이 반이다.',
    '포기하지 않으면 반드시 성공한다.',
    '노력은 배신하지 않는다.',
    '오늘 할 수 있는 일을 내일로 미루지 말라.',
    '꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다.',
    '실패는 성공의 어머니다.',
    '인내는 쓰지만 그 열매는 달다.',
    '자신감은 성공의 첫 번째 비밀이다.',
    '목표를 향해 꾸준히 나아가면 언젠가 도달한다.',
    '오늘의 선택이 내일의 나를 만든다.',
  ];

  try {
    // Add timeout to prevent hanging on SSL errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://korean-advice-open-api.vercel.app/api/advice', {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to fetch Korean quote');
    }
    const data = await response.json();
    // API는 'message' 필드를 반환합니다 (not 'advice')
    return data.message || fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  } catch (error) {
    // Silently handle error (including SSL errors) - no console log
    // Return random fallback quote
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
};

/**
 * Fetch random quote based on language
 */
export const fetchRandomQuote = async (language: string): Promise<string> => {
  if (language === 'ko' || language.startsWith('ko')) {
    return await fetchKoreanQuote();
  }
  return await fetchEnglishQuote();
};
