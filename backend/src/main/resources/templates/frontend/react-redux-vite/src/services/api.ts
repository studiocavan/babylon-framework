// TODO: make this dynamic based on environment variables
const API_BASE_URL = 'http://localhost:8080/api';

export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
