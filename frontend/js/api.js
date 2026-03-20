// frontend/js/api.js
const API_URL = window.location.origin + '/api';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    };
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data     = await response.json();
    if (!response.ok) throw new Error(data.error || `API Error ${response.status}`);
    return data;
}

const api = {
    login:          (email, password) => apiRequest('/auth/login',    { method:'POST', body: JSON.stringify({ email, password }) }),
    register:       (n, e, p, s)     => apiRequest('/auth/register',  { method:'POST', body: JSON.stringify({ name:n, email:e, password:p, school:s }) }),
    getUser:        ()                => apiRequest('/user'),
    updateUser:     (data)            => apiRequest('/user',           { method:'PUT',  body: JSON.stringify(data) }),
    getProgress:    ()                => apiRequest('/progress'),
    updateProgress: (topicId, subject, quality) => apiRequest('/progress', { method:'POST', body: JSON.stringify({ topicId, subject, quality }) }),
    getFlashcards:  (subject='all')   => apiRequest(`/flashcards?subject=${subject}`),
    saveFlashcards: (cards)           => apiRequest('/flashcards',     { method:'POST', body: JSON.stringify(cards) }),
    uploadFile: (formData) => {
        const token = localStorage.getItem('token');
        return fetch(`${API_URL}/upload`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: formData }).then(r => r.json());
    },
    chatWithAI:   (message, context)             => apiRequest('/ai/chat', { method:'POST', body: JSON.stringify({ message, context }) }),
    generateTask: (subject, topic, diff, kurs)   => apiRequest('/ai/task', { method:'POST', body: JSON.stringify({ subject, topic, difficulty:diff, kurs }) }),
    createSession: (topics)   => apiRequest('/sessions',         { method:'POST', body: JSON.stringify({ topics }) }),
    endSession:    (id, dur)  => apiRequest(`/sessions/${id}`,   { method:'PUT',  body: JSON.stringify({ duration: dur }) }),
    getCurriculum: ()         => apiRequest('/curriculum'),
};
