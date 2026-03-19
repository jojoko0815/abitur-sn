// API Configuration
const API_URL = window.location.origin + '/api';

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API Error');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// API Methods
const api = {
    // Auth
    login: (email, password) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    
    register: (name, email, password, school) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, school })
    }),
    
    // User
    getUser: () => apiRequest('/user'),
    updateUser: (data) => apiRequest('/user', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    // Progress
    getProgress: () => apiRequest('/progress'),
    updateProgress: (topicId, subject, quality) => apiRequest('/progress', {
        method: 'POST',
        body: JSON.stringify({ topicId, subject, quality })
    }),
    
    // Flashcards
    getFlashcards: (subject = 'all') => apiRequest(`/flashcards?subject=${subject}`),
    createFlashcards: (flashcards) => apiRequest('/flashcards', {
        method: 'POST',
        body: JSON.stringify(flashcards)
    }),
    
    // Upload
    uploadFile: (formData) => {
        const token = localStorage.getItem('token');
        return fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        }).then(r => r.json());
    },
    
    // AI Tutor
    chatWithAI: (message, context) => apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context })
    }),
    
    // Sessions
    createSession: (topics) => apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({ topics })
    })
};