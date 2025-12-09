import React, { useState } from "react";
import { reviewService } from "../../services/reviewService";

const ReviewModal = ({ booking, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await reviewService.submitReview({
        bookingId: booking.id,
        rating: rating,
        comment: comment.trim() || null,
      });

      if (response.success) {
        alert("Review submitted successfully!");
        onSubmitSuccess();
        onClose();
      } else {
        setError(response.message || "Failed to submit review");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Determine who is being reviewed
  const isDriver = booking.ride?.driver;
  const revieweeName = isDriver ? booking.ride.driver.name : "the passenger";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate Your Experience</h3>
          <button onClick={onClose} className="close-btn" disabled={submitting}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Ride Details */}
          <div className="review-ride-info">
            <div className="route-text">
              {booking.ride?.source} → {booking.ride?.destination}
            </div>
            <div className="review-subtitle">
              How was your experience with {revieweeName}?
            </div>
          </div>

          {/* Star Rating */}
          <div className="rating-section">
            <label className="form-label">Your Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${
                    star <= (hoveredRating || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={submitting}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="rating-label">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">
              Share Your Experience (Optional)
            </label>
            <textarea
              className="form-input"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your journey..."
              maxLength="500"
              disabled={submitting}
            />
            <div className="char-count">{comment.length}/500</div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(2px);
        }
        .modal-content {
          background: white;
          width: 90%;
          max-width: 500px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }
        .close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .review-ride-info {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .route-text {
          font-weight: 700;
          font-size: 1.1rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .review-subtitle {
          color: #6b7280;
          font-size: 0.9rem;
        }
        .rating-section {
          margin-bottom: 1.5rem;
        }
        .star-rating {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin: 1rem 0;
        }
        .star {
          background: none;
          border: none;
          font-size: 2.5rem;
          color: #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
          line-height: 1;
        }
        .star:hover:not(:disabled),
        .star.active {
          color: #fbbf24;
          transform: scale(1.1);
        }
        .star:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .rating-label {
          text-align: center;
          font-weight: 600;
          color: #2563eb;
          margin-top: 0.5rem;
        }
        .char-count {
          text-align: right;
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        .alert-error {
          background: #fef2f2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          border: 1px solid #fecaca;
          margin-bottom: 1rem;
        }
        .flex {
          display: flex;
        }
        .gap-2 {
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;