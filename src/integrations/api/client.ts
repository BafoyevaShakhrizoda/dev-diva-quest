const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://devgirlzz.onrender.com/api/';

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Email verification
  async verifyEmail(uid: string, token: string) {
    return this.post('users/verify-email/', { uid, token });
  },

  async resendVerification() {
    return this.post('users/resend-verification/', {});
  },

  // Jobs
  async getAllJobs(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.get(`jobs/all/${query}`);
  },

  async applyJob(jobId: number, data: any) {
    return this.post(`jobs/apply/${jobId}/`, data);
  },

  async getCVs() {
    return this.get('cv/my-cvs/');
  },

  async generateCV(data: any) {
    return this.post('cv/generate/', data);
  },
};
