import { useState } from 'react';

/**
 * Discussion feed for Book Club detail view.
 * Handles rendering member discussion messages and sending new posts.
 */
export default function BookClubDiscussion({
  messages = [],
  currentUserId,
  isOwner,
  onSendMessage,
  onDeleteMessage,
  messagesEndRef,
}) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const success = await onSendMessage(content);
    if (success) {
      setContent('');
    }
    setSending(false);
  };

  return (
    <section className="bcd-page__discussion">
      <div className="bcd-page__messages-list">
        {messages.length === 0 ? (
          <div className="bcd-page__empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const canDelete = isOwner || msg.authorId === currentUserId;
            return (
              <div key={msg._id || msg.id} className="bcd-page__message">
                <div className="bcd-page__message-header">
                  <span className="bcd-page__message-author">{msg.authorName}</span>
                  <span className="bcd-page__message-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      className="bcd-page__msg-delete"
                      onClick={() => onDeleteMessage(msg._id || msg.id)}
                      title="Delete message"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="bcd-page__message-content">{msg.content}</p>
                {msg.bookId && (
                  <span className="bcd-page__message-book-tag">📚 {msg.bookId}</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="bcd-page__message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="bcd-page__message-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
        />
        <button
          type="submit"
          className="bcd-page__send-btn"
          disabled={sending || !content.trim()}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  );
}
