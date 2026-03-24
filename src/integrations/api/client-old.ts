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

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) {
    return this.request('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/users/logout/', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/users/profile/');
  }

  async updateProfile(data: any) {
    return this.request('/users/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Skills endpoints
  async getQuestions(role: string) {
    return this.request(`/skills/questions/?role=${role}`);
  }

  async evaluateSkill(data: {
    role: string;
    questions: any[];
    answers: number[];
  }) {
    return this.request('/skills/evaluate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyTests() {
    return this.request('/skills/my-tests/');
  }

  async getTestDetail(testId: number) {
    return this.request(`/skills/tests/${testId}/`);
  }

  async getTestResults() {
    return this.request('/skills/results/');
  }

  // CV endpoints
  async generateCV(data: any) {
    return this.request('/cv/generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCVs() {
    return this.request('/cv/my-cvs/');
  }

  async getCV(cvId: number) {
    return this.request(`/cv/cvs/${cvId}/`);
  }

  async updateCV(cvId: number, data: any) {
    return this.request(`/cv/cvs/${cvId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCV(cvId: number) {
    return this.request(`/cv/cvs/${cvId}/`, {
      method: 'DELETE',
    });
  }

  // Jobs endpoints
  async getRecommendedJobs() {
    return this.request('/jobs/recommended/');
  }

  async getAllJobs(params?: {
    role?: string;
    level?: string;
    location?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.level) searchParams.append('level', params.level);
    if (params?.location) searchParams.append('location', params.location);
    
    const url = searchParams.toString() ? `/jobs/all/?${searchParams.toString()}` : '/jobs/all/';
    return this.request(url);
  }

  async applyJob(jobId: number, data: {
    cv?: number;
    cover_letter?: string;
  }) {
    return this.request(`/jobs/apply/${jobId}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    return this.request('/jobs/my-applications/');
  }

  async getJobApplications(jobId: number) {
    return this.request(`/jobs/applications/${jobId}/`);
  }

  async updateApplicationStatus(applicationId: number, status: string) {
    return this.request(`/jobs/applications/${applicationId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async saveJobMatch(jobId: number) {
    return this.request(`/jobs/save/${jobId}/`, {
      method: 'POST',
    });
  }

  // Email verification
  async verifyEmail(uid: string, token: string) {
    return this.request<{ success: boolean; error?: string }>({
      endpoint: 'users/verify-email/',
      method: 'POST',
      body: { uid, token },
    });
  }

  async resendVerification() {
    return this.request<{ success: boolean; error?: string }>({
      endpoint: 'users/resend-verification/',
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
