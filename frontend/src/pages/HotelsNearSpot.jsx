import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Hotels() {
  const { spotId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/hotels/${spotId}`);
        setHotels(res.data.hotels || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [spotId]);

  if (loading) {
    return <div className="text-center py-5">Loading hotels...</div>;
  }

  if (!hotels.length) {
    return <div className="text-center py-5">No hotels found in this location.</div>;
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Hotels in this Location</h2>
      <div className="row g-4">
        {hotels.map(hotel => (
          <div key={hotel.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm rounded-4 border-0">
              <img
                src={hotel.image_url || "https://via.placeholder.com/400x200?text=Hotel"}
                className="card-img-top"
                alt={hotel.name}
                style={{ height: "180px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{hotel.name}</h5>
                <p className="card-text"><b>Location:</b> {hotel.location}</p>
                <p className="card-text"><b>Rating:</b> {hotel.rating || "N/A"}</p>
                <Link to={`/hotel/${hotel.id}`} className="btn btn-primary btn-sm">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
