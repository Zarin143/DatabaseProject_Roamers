import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

export default function Recommended() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get logged-in user info
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch recommended places for this user
      axios
        .get(`http://localhost:5000/recommended/${parsedUser.id}`)
        .then((res) => {
          setSpots(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching recommended spots:", err);
          setError("Failed to load recommended places");
          setLoading(false);
        });
    } else {
      setError("You must be logged in to see recommended places.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning text-center mt-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: "100vh" }}>
      <h1 className="text-center text-primary mb-5">Recommended Places for You</h1>

      {spots.length === 0 ? (
        <p className="text-center">No recommended places found for your location.</p>
      ) : (
        <div className="row g-4 justify-content-center">
          {spots.map((spot) => (
            <div key={spot.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm rounded-4 border-0 hover-scale">
                <Link to={`/spot/${spot.id}`}>
                  <img
                    src={spot.image_url}
                    className="card-img-top rounded-top-4"
                    alt={spot.name}
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                </Link>
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/spot/${spot.id}`} className="text-decoration-none text-dark">
                      {spot.name}
                    </Link>
                  </h5>
                  <p className="card-text mb-1"><b>Location:</b> {spot.location}</p>
                  <p className="card-text mb-1"><b>Distance:</b> {spot.distance_from_current_location} km</p>
                  <p className="card-text mb-1"><b>Travel Time:</b> {spot.estimated_travel_time}</p>
                  <p className="card-text text-muted" style={{ fontSize: "13px" }}>{spot.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .hover-scale:hover {
          transform: scale(1.03);
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
