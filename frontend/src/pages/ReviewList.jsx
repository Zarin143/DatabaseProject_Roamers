import { useEffect, useState } from "react";
import axios from "axios";

export default function ReviewList({ spotId }) {
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ rating: 5, comment: "" });

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/reviews/${spotId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [spotId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setEditData({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/reviews/${id}`,
        { ...editData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="mt-4">
      <h4>Reviews</h4>
      {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
      {reviews.map((review) => (
        <div key={review.id} className="card mb-3">
          <div className="card-body">
            {editingId === review.id ? (
              <>
                <select
                  className="form-select mb-2"
                  value={editData.rating}
                  onChange={(e) => setEditData({ ...editData, rating: parseInt(e.target.value) })}
                >
                  {[5,4,3,2,1].map(r => (
                    <option key={r} value={r}>{r} ⭐</option>
                  ))}
                </select>
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={editData.comment}
                  onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                ></textarea>
                <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(review.id)}>
                  Save
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h6>{review.username} – {review.rating} ⭐</h6>
                <p>{review.comment}</p>
                <small className="text-muted">{new Date(review.created_at).toLocaleString()}</small>
                {user && user.id === review.user_id && (
                  <div className="mt-2">
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(review)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(review.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
