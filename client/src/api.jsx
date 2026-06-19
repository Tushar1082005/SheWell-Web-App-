const API_BASE = 'http://localhost:3001/api/shewell';

export const api = {
  // Discussions
  getDiscussions: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/discussions?${query}`);
    return response.json();
  },

  createDiscussion: async (data) => {
    const response = await fetch(`${API_BASE}/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  likeDiscussion: async (id) => {
    const response = await fetch(`${API_BASE}/discussions/${id}/like`, {
      method: 'PUT',
    });
    return response.json();
  },

  deleteDiscussion: async (id) => {
    const response = await fetch(`${API_BASE}/discussions/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Replies
  createReply: async (discussionId, data) => {
    const response = await fetch(`${API_BASE}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  likeReply: async (discussionId, replyId) => {
    const response = await fetch(
      `${API_BASE}/discussions/${discussionId}/replies/${replyId}/like`,
      { method: 'PUT' }
    );
    return response.json();
  },

  deleteReply: async (discussionId, replyId) => {
    const response = await fetch(
      `${API_BASE}/discussions/${discussionId}/replies/${replyId}`,
      { method: 'DELETE' }
    );
    return response.json();
  },
};