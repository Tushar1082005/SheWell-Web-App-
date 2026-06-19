import React, { useState, useEffect } from 'react';
import { api } from '../api'; // Ensure this points to your API service file

function Community() {
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('likes'); // 'likes', 'newest', 'activity'
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Generate a random anonymous username
  const generateAnonymousName = () => {
    const randomChars = Math.random().toString(36).substring(2, 8);
    return `Anonymous_${randomChars}`;
  };

  const [myAnonymousId] = useState(generateAnonymousName());

  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDiscussions({ sortBy, searchQuery });
        setDiscussions(data);
      } catch (error) {
        showNotification('Failed to load discussions', 'error');
      }
      setIsLoading(false);
    };

    fetchDiscussions();
  }, [sortBy, searchQuery]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePostDiscussion = async () => {
    if (!newDiscussion.trim()) return;

    setIsLoading(true);
    try {
      const discussion = await api.createDiscussion({
        text: newDiscussion,
        author: myAnonymousId,
      });
      setDiscussions([...discussions, discussion]);
      setNewDiscussion('');
      setSelectedDiscussion(discussion._id);
      showNotification('Discussion posted successfully!');
    } catch (error) {
      showNotification('Failed to post discussion', 'error');
    }
    setIsLoading(false);
  };

  const handleLikeDiscussion = async (id) => {
    try {
      await api.likeDiscussion(id);
      setDiscussions(discussions.map((d) =>
        d._id === id ? { ...d, likes: d.likes + 1 } : d
      ));
      showNotification('Like added!', 'info');
    } catch (error) {
      showNotification('Failed to like discussion', 'error');
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts({ ...replyTexts, [id]: text });
  };

  const handleReplySubmit = async (id) => {
    if (!replyTexts[id]?.trim()) return;

    setIsLoading(true);
    try {
      const reply = await api.createReply(id, {
        text: replyTexts[id],
        author: myAnonymousId,
      });
      setDiscussions(discussions.map((d) =>
        d._id === id
          ? { ...d, replies: [...d.replies, reply], lastActivity: new Date().toISOString() }
          : d
      ));
      setReplyTexts({ ...replyTexts, [id]: '' });
      showNotification('Reply posted successfully!');
    } catch (error) {
      showNotification('Failed to post reply', 'error');
    }
    setIsLoading(false);
  };

  const handleLikeReply = async (discussionId, replyId) => {
    try {
      await api.likeReply(discussionId, replyId);
      setDiscussions(discussions.map((d) =>
        d._id === discussionId
          ? {
              ...d,
              replies: d.replies.map((r) =>
                r._id === replyId ? { ...r, likes: r.likes + 1 } : r
              ),
            }
          : d
      ));
      showNotification('Like added!', 'info');
    } catch (error) {
      showNotification('Failed to like reply', 'error');
    }
  };

  const selectDiscussion = (id) => {
    setSelectedDiscussion(id);
  };

  const deleteDiscussion = async (id) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      try {
        await api.deleteDiscussion(id);
        setDiscussions(discussions.filter((d) => d._id !== id));
        if (selectedDiscussion === id) setSelectedDiscussion(null);
        showNotification('Discussion deleted', 'warning');
      } catch (error) {
        showNotification('Failed to delete discussion', 'error');
      }
    }
  };

  const deleteReply = async (discussionId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        await api.deleteReply(discussionId, replyId);
        setDiscussions(discussions.map((d) =>
          d._id === discussionId
            ? { ...d, replies: d.replies.filter((r) => r._id !== replyId) }
            : d
        ));
        showNotification('Reply deleted', 'warning');
      } catch (error) {
        showNotification('Failed to delete reply', 'error');
      }
    }
  };

  const filteredAndSortedDiscussions = [...discussions]
    .filter((discussion) =>
      discussion.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'activity') return new Date(b.lastActivity) - new Date(a.lastActivity);
      return 0;
    });

  const topDiscussions = filteredAndSortedDiscussions.slice(0, 10);
  const currentDiscussion = discussions.find((d) => d._id === selectedDiscussion);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date().getTime();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-pink-50 min-h-screen my-4 rounded-xl">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : notification.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className="mb-6 text-center border-b border-pink-200 pb-4">
        <h1 className="text-3xl font-bold text-pink-700">Community for Women</h1>
        <p className="text-pink-600 mt-2">A safe space to connect, share, and support each other</p>
      </header>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-700 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            className="w-full p-2 pl-10 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-pink-700">Sort by:</label>
          <select
            className="p-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="likes">Most Likes</option>
            <option value="newest">Newest</option>
            <option value="activity">Recent Activity</option>
          </select>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-pink-200">
        <h2 className="text-xl font-semibold mb-3 text-pink-700">Start a Discussion</h2>
        <textarea
          className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          rows="3"
          value={newDiscussion}
          onChange={(e) => setNewDiscussion(e.target.value)}
          placeholder="What's on your mind? Start a new discussion..."
        />
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Posting as <span className="font-medium text-pink-600">{myAnonymousId}</span>
          </div>
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition flex items-center"
            onClick={handlePostDiscussion}
            disabled={isLoading || !newDiscussion.trim()}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
            Post Discussion
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 bg-white rounded-lg shadow-md p-4 border border-pink-200">
          <h2 className="text-lg font-semibold mb-4 text-pink-700 border-b border-pink-100 pb-2 flex justify-between items-center">
            <span>Top Discussions</span>
            <span className="text-xs text-gray-500 font-normal">{filteredAndSortedDiscussions.length} total</span>
          </h2>
          {topDiscussions.length === 0 ? (
            <div className="text-center py-8 text-pink-400 italic">
              {searchQuery
                ? 'No discussions match your search'
                : 'No discussions yet. Be the first to start a conversation!'}
            </div>
          ) : (
            <div className="space-y-3">
              {topDiscussions.map((discussion) => (
                <div
                  key={discussion._id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedDiscussion === discussion._id
                      ? 'bg-pink-100 border-pink-300 border'
                      : 'hover:bg-pink-50 border border-transparent'
                  }`}
                  onClick={() => selectDiscussion(discussion._id)}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-pink-600 text-sm">{discussion.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(discussion.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm line-clamp-2">{discussion.text}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        ></path>
                      </svg>
                      {discussion.replies.length}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                      {discussion.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredAndSortedDiscussions.length > 10 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-pink-600 hover:text-pink-800 hover:underline">
                View All Discussions
              </button>
            </div>
          )}
        </div>

        <div className="md:w-2/3 bg-white rounded-lg shadow-md p-4 border border-pink-200">
          {!currentDiscussion ? (
            <div className="text-center py-16 text-pink-400 italic">
              <svg
                className="w-12 h-12 mx-auto text-pink-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Select a discussion to view details or create a new one
            </div>
          ) : (
            <div>
              <div className="mb-4 pb-4 border-b border-pink-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-pink-600">{currentDiscussion.author}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTimeAgo(currentDiscussion.timestamp)}
                    </span>
                  </div>
                  <div className="relative group">
                    <button className="p-1 rounded-full hover:bg-pink-100">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        ></path>
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                      <div className="py-1">
                        {currentDiscussion.author === myAnonymousId && (
                          <button
                            onClick={() => deleteDiscussion(currentDiscussion._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete Discussion
                          </button>
                        )}
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Report
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 mb-3 whitespace-pre-line">{currentDiscussion.text}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <button
                    onClick={() => handleLikeDiscussion(currentDiscussion._id)}
                    className="flex items-center mr-4 hover:text-pink-500"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      ></path>
                    </svg>
                    {currentDiscussion.likes} {currentDiscussion.likes === 1 ? 'like' : 'likes'}
                  </button>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      ></path>
                    </svg>
                    {currentDiscussion.replies.length}{' '}
                    {currentDiscussion.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-pink-700 mb-3">Replies</h3>
                <div className="mb-6 p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <textarea
                    className="w-full p-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
                    rows="2"
                    placeholder="Add a reply..."
                    value={replyTexts[currentDiscussion._id] || ''}
                    onChange={(e) => handleReplyChange(currentDiscussion._id, e.target.value)}
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Replying as <span className="font-medium text-pink-600">{myAnonymousId}</span>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm flex items-center"
                      onClick={() => handleReplySubmit(currentDiscussion._id)}
                      disabled={!replyTexts[currentDiscussion._id]?.trim()}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        ></path>
                      </svg>
                      Post Reply
                    </button>
                  </div>
                </div>
                {currentDiscussion.replies.length === 0 ? (
                  <div className="text-center py-8 text-pink-400 italic text-sm">
                    No replies yet. Be the first to respond!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentDiscussion.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="p-3 rounded-lg border border-pink-100 bg-white hover:bg-pink-50 transition"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="font-medium text-pink-600">{reply.author}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTimeAgo(reply.timestamp)}
                            </span>
                            {reply.author === myAnonymousId && (
                              <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          {reply.author === myAnonymousId && (
                            <div className="relative group">
                              <button className="p-1 rounded-full hover:bg-pink-100">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  ></path>
                                </svg>
                              </button>
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => deleteReply(currentDiscussion._id, reply._id)}
                                    className="block w-full text-left px-3 py-1 text-xs text-red-600 hover:bg-gray-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700">{reply.text}</p>
                        <button
                          onClick={() => handleLikeReply(currentDiscussion._id, reply._id)}
                          className="mt-1 text-xs flex items-center text-gray-500 hover:text-pink-500"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            ></path>
                          </svg>
                          {reply.likes} {reply.likes === 1 ? 'like' : 'likes'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;