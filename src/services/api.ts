import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Word {
  id: string;
  word: string;
  meaning: string;
  difficulty: string;
}

export const wordApi = {
  getRandomWord: async (difficulty: string = 'EASY'): Promise<Word> => {
    const response = await axios.get(`${API_BASE_URL}/words/random?difficulty=${difficulty}`);
    return response.data;
  },

  getWord: async (word: string): Promise<Word> => {
    const response = await axios.get(`${API_BASE_URL}/words/${word}`);
    return response.data;
  },

  getAllWords: async (): Promise<Word[]> => {
    const response = await axios.get(`${API_BASE_URL}/words`);
    return response.data;
  },

  createWord: async (word: Omit<Word, 'id'>): Promise<Word> => {
    const response = await axios.post(`${API_BASE_URL}/words`, word);
    return response.data;
  },
}; 