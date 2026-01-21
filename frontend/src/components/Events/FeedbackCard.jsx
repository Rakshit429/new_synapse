import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FeedbackCard = ({ eventId, eventName, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    
    try {
      setLoading(true);
      // Calls the feedback endpoint defined in your backend
      await api.post(`/events/${eventId}/feedback`, { rating });
      toast.success("Thanks for your feedback!");
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-3 rounded-3 mb-3 border border-secondary">
      <h6 className="text-white mb-2">Rate: <span className="text-accent">{eventName}</span></h6>
      <p className="text-secondary small mb-3">How was your experience?</p>
      
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-1">
          {[...Array(10)].map((_, index) => {
            const starValue = index + 1;
            return (
              <Star
                key={index}
                size={18}
                className="cursor-pointer transition-colors"
                fill={starValue <= (hover || rating) ? "#fbbf24" : "none"}
                color={starValue <= (hover || rating) ? "#fbbf24" : "#666"}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(starValue)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </div>
        
        <button 
          className="btn btn-sm btn-purple d-flex align-items-center gap-2"
          onClick={handleSubmit}
          disabled={loading || rating === 0}
        >
          {loading ? '...' : <Send size={14} />}
        </button>
      </div>
      <div className="text-end mt-1">
        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>{rating}/10</span>
      </div>
    </div>
  );
};

export default FeedbackCard;