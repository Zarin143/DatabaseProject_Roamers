import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function MostVisitedPlaces() {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/mostvisitedplaces")
      .then((res) => setSpots(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-primary">Most Visited Places</h2>
      <div className="row g-4">
        {spots.map((spot) => (
          <div key={spot.spot_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm rounded-4 border-0">
              <Link to={`/spot/${spot.spot_id}`}>
                <img src={spot.image_url} className="card-img-top" alt={spot.name} style={{ height: "180px", objectFit: "cover" }} />
              </Link>
              <div className="card-body">
                <h5 className="card-title">{spot.name}</h5>
                <p className="card-text"><b>Location:</b> {spot.location}</p>
                <p className="card-text"><b>Category:</b> {spot.category}</p>
                <p className="card-text"><b>Bookings:</b> {spot.booking_count}</p>
                <Link to={`/spot/${spot.spot_id}`} className="btn btn-primary btn-sm">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
