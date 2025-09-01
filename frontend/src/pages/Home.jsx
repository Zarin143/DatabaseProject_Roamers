import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/tourist-spots")
      .then((res) => setSpots(res.data))
      .catch((err) => console.error(err));
  }, []);

  // group spots by category
  const grouped = spots.reduce((acc, spot) => {
    if (!acc[spot.category]) acc[spot.category] = [];
    acc[spot.category].push(spot);
    return acc;
  }, {});

  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f9f9f9",
    minHeight: "100vh",
  };

  const categoryStyle = {
    margin: "30px 0",
  };

  const cardStyle = {
    background: "#fff",
    padding: "15px",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    width: "250px",
    textAlign: "center",
  };

  const gridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
  };

  const imgStyle = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Explore Bangladesh</h1>

      {Object.keys(grouped).map((category) => (
        <div key={category} style={categoryStyle}>
          <h2 style={{ color: "#2c3e50" }}>{category.toUpperCase()}</h2>
          <div style={gridStyle}>
            {grouped[category].map((spot) => (
              <div key={spot.id} style={cardStyle}>
                <img src={spot.image_url} alt={spot.name} style={imgStyle} />
                <h3>{spot.name}</h3>
                <p>
                  <b>Location:</b> {spot.location}
                </p>
                <p>
                  <b>Distance:</b> {spot.distance} km
                </p>
                <p>
                  <b>Travel Time:</b> {spot.travel_time}
                </p>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  {spot.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
