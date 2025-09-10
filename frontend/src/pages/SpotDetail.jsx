import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("explore");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tourist-spots/${id}`);
        setSpot(response.data);
      } catch (error) {
        console.error("Error fetching spot details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [id]);

  // Add to favorites handler
  const handleAddFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        navigate('/login');
        return;
      }
      
      await axios.post(`http://localhost:5000/favorites`, 
        { spotId: spot.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to favorites!");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please log in again");
        navigate('/login');
      } else {
        alert(err.response?.data?.error || "Could not add to favorites");
      }
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        navigate('/login');
        return;
      }
      
      // Here you would call your review API endpoint
      console.log("Submitting review:", review);
      alert("Review submitted successfully!");
      setShowReviewModal(false);
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  // Generate Google Maps URL based on location
  const getGoogleMapsUrl = () => {
    if (!spot) return "#";
    const encodedLocation = encodeURIComponent(`${spot.name}, ${spot.location}`);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="container py-5 text-center">
        <h2>Spot not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header Section with Image */}
      <div className="position-relative">
        <img
          src={spot.image_url || "https://via.placeholder.com/800x400?text=Spot+Image"}
          alt={spot.name}
          className="w-100"
          style={{ height: "50vh", objectFit: "cover" }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-40"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light position-absolute top-0 start-0 m-4 rounded-circle"
          style={{ width: "50px", height: "50px", zIndex: 10 }}
        >
          ←
        </button>

        {/* Header Content */}
        <div className="position-absolute bottom-0 start-0 w-100 text-white p-4">
          <div className="container">
            <h1 className="display-5 fw-bold mb-2">{spot.name}</h1>
            <p className="lead mb-3 text-capitalize">
              {spot.category} experience in {spot.location}
            </p>

            <div className="d-flex align-items-center gap-4 mb-3 flex-wrap">
              <div className="d-flex align-items-center bg-dark bg-opacity-50 px-3 py-1 rounded">
                <i className="bi bi-clock me-2"></i>
                <span>{spot.estimated_travel_time || "Full day experience"}</span>
              </div>
              <div className="d-flex align-items-center bg-dark bg-opacity-50 px-3 py-1 rounded">
                <i className="bi bi-geo-alt me-2"></i>
                <span>{spot.distance_from_current_location} km away</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Left Column - Main Content */}
          <div className="col-lg-8">
            {/* Navigation Tabs */}
            <div className="bg-white rounded shadow-sm mb-4">
              <div className="d-flex justify-content-between align-items-center p-3">
                <div className="d-flex gap-3">
                  <button
                    className={`btn ${activeTab === "explore" ? "btn-primary" : "btn-outline-primary"} rounded-pill`}
                    onClick={() => setActiveTab("explore")}
                  >
                    Explore
                  </button>
                  <button
                    className={`btn ${activeTab === "map" ? "btn-primary" : "btn-outline-primary"} rounded-pill`}
                    onClick={() => setActiveTab("map")}
                  >
                    Map
                  </button>
                </div>

                {/* Share and Action Buttons */}
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary rounded-pill">
                    <i className="bi bi-share me-2"></i>Share
                  </button>
                  <button className="btn btn-outline-primary rounded-pill" onClick={handleAddFavorite}>
                    <i className="bi bi-heart me-2"></i>
                    Add to Favorites
                  </button>
                  <Link to="/favorites" className="btn btn-primary rounded-pill">
                    <i className="bi bi-collection me-2"></i>
                    View Favorites
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "explore" && (
              <div className="bg-white rounded shadow-sm p-4">
                <h3 className="mb-3">About {spot.name}</h3>
                <p className="lead">{spot.description}</p>
                
                {/* Additional Information */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h5>Details</h5>
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="text-muted">Category:</span>
                          <span className="fw-bold text-capitalize">{spot.category}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="text-muted">Location:</span>
                          <span className="fw-bold">{spot.location}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="text-muted">Distance:</span>
                          <span className="fw-bold">{spot.distance_from_current_location} km</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2">
                          <span className="text-muted">Travel Time:</span>
                          <span className="fw-bold">{spot.estimated_travel_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h5>Best Time to Visit</h5>
                    <div className="card border-0 bg-warning bg-opacity-10">
                      <div className="card-body">
                        <p className="mb-2">November to March offers the best weather conditions for visiting {spot.name}.</p>
                        <small className="text-muted">Recommended duration: 2-3 days</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "map" && (
              <div className="bg-white rounded shadow-sm p-4">
                <h3 className="mb-3">Location Map</h3>
                <div className="card border-0">
                  <div className="card-body text-center p-5 bg-light rounded">
                    <i className="bi bi-map display-1 text-muted mb-3"></i>
                    <p className="text-muted">
                      Interactive map showing {spot.name} in {spot.location}
                    </p>
                    <a 
                      href={getGoogleMapsUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      <i className="bi bi-geo-alt me-2"></i>
                      Open in Google Maps
                    </a>
                  </div>
                </div>

                {/* Embedded Google Maps Iframe */}
                <div className="mt-4">
                  <h5>Location Preview</h5>
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(spot.location)}&z=13&output=embed`}
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen
                      title={`Map of ${spot.name}`}
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-primary text-white border-0">
                  <h5 className="mb-0">Plan Your Visit</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2 mb-3">
                    <button className="btn btn-success btn-lg rounded-pill">
                      <i className="bi bi-calendar-check me-2"></i>
                      Book Tour
                    </button>
                    <button className="btn btn-info btn-lg rounded-pill">
                      <i className="bi bi-building me-2"></i>
                      Find Hotels
                    </button>
                    <button 
                      className="btn btn-warning rounded-pill"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <i className="bi bi-star me-2"></i>
                      Write Review
                    </button>
                  </div>
                </div>
              </div>

      
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Write a Review for {spot.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select 
                      className="form-select"
                      value={review.rating}
                      onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
                      required
                    >
                      <option value={5}>5 ⭐ (Excellent)</option>
                      <option value={4}>4 ⭐ (Very Good)</option>
                      <option value={3}>3 ⭐ (Good)</option>
                      <option value={2}>2 ⭐ (Fair)</option>
                      <option value={1}>1 ⭐ (Poor)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Review</label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={review.comment}
                      onChange={(e) => setReview({...review, comment: e.target.value})}
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-2">&copy; {new Date().getFullYear()} Roamers. All rights reserved.</p>
        </div>
      </footer>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
      />

      <style>{`
        .sticky-top {
          position: sticky;
          z-index: 100;
        }
        .btn-rounded {
          border-radius: 50px;
        }
      `}</style>
    </div>
  );
}