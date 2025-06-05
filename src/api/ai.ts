import { config } from '../config';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = config.OPENAI_API_KEY;

// Initial API configuration check
console.log('=== API Configuration ===');
console.log('API URL:', OPENAI_API_URL);
console.log('API Key exists:', !!OPENAI_API_KEY);
console.log('API Key length:', OPENAI_API_KEY?.length);
console.log('API Key format:', OPENAI_API_KEY?.startsWith('sk-') ? 'Correct' : 'Incorrect');
console.log('API Key first 10 chars:', OPENAI_API_KEY?.substring(0, 10) + '...');

export interface AIResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const sendMessageToAI = async (message: string): Promise<string> => {
  console.log('\n=== Starting API Call ===');
  console.log('Input message:', message);

  if (!OPENAI_API_KEY) {
    console.error('❌ API Key is missing!');
    return 'Please set up your OpenAI API key';
  }

  try {
    console.log('\n=== Preparing Request ===');
    const headers = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      model: 'gpt-3.5-turbo-0125', // Most cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Keep responses concise.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150, // Reduced token limit for cost efficiency
      presence_penalty: 0.6,
      frequency_penalty: 0.6
    };

    console.log('\n=== Request Details ===');
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Full URL:', OPENAI_API_URL);

    console.log('\n=== Making API Call ===');
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('\n=== Response Details ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n=== Error Details ===');
      console.error('Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Parsed Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response');
        errorData = { error: errorText };
      }

      if (response.status === 401) {
        throw new Error('Authentication error: Please check your API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Please try again in a few moments');
      } else if (response.status === 400) {
        throw new Error(`Invalid request: ${errorData?.error?.message || response.statusText}`);
      } else if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the API URL and try again.');
      } else {
        throw new Error(`API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
    }

    const data: AIResponse = await response.json();
    console.log('\n=== Success Response ===');
    console.log('Response Data:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('❌ Invalid response format');
      throw new Error('Invalid response format from AI service');
    }

    console.log('\n=== API Call Complete ===');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('\n=== Fatal Error ===');
    console.error('Error details:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Please check your internet connection');
    }
    throw error;
  }
};
