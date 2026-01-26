/**
 * Fetch random inspirational quotes based on language
 */

interface QuoteResponse {
  quote: string;
  author?: string;
}

/**
 * Fetch random English quote from Quotable API
 */
export const fetchEnglishQuote = async (): Promise<string> => {
  // Fallback quotes
  const fallbackQuotes = [
    'The only way to do great work is to love what you do.',
    'Success is the sum of small efforts repeated day in and day out.',
    'Focus on being productive, not busy.',
    'The future depends on what you do today.',
    'Stay focused and keep moving forward.',
  ];

  try {
    // Add timeout to prevent hanging on SSL errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://api.quotable.io/random?maxLength=100', {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    return data.content || fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  } catch (error) {
    // Silently handle error (including SSL errors) - no console log
    // Return random fallback quote
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
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
