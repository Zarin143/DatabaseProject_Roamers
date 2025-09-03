import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/tourist-spots")
      .then((res) => setSpots(res.data))
      .catch((err) => console.error(err));
  }, []);

  const grouped = spots.reduce((acc, spot) => {
    if (!acc[spot.category]) acc[spot.category] = [];
    acc[spot.category].push(spot);
    return acc;
  }, {});

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">Roamers</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Tours</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Contact</a></li>
            </ul>
            <div className="ms-3 d-flex gap-2">
              <a href="/login" className="btn btn-outline-light">Login</a>
              <a href="/register" className="btn btn-light">Register</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?bangladesh,travel')" }}
      >
        <div className="hero-content">
          <h1 className="display-4 fw-bold">Explore Bangladesh</h1>
          <p className="lead">Discover the best tourist spots, beaches, mountains, and cities across Bangladesh.</p>
          <a href="#tours" className="btn btn-light btn-lg mt-3">View Tours</a>
        </div>
      </section>

      {/* Tourist Spots */}
      <main id="tours" className="py-5">
        <div className="container" style={{ maxWidth: "1200px" }}>
          {Object.keys(grouped).map((category) => (
            <div key={category} className="mb-5">
              <h2 className="mb-4 text-center">{category.toUpperCase()}</h2>
              <div className="row g-4 justify-content-center">
                {grouped[category].map((spot) => (
                  <div key={spot.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 shadow-sm">
                      <img
                        src={spot.image_url}
                        className="card-img-top"
                        alt={spot.name}
                        style={{ height: "180px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{spot.name}</h5>
                        <p className="card-text"><b>Location:</b> {spot.location}</p>
                        <p className="card-text"><b>Distance:</b> {spot.distance} km</p>
                        <p className="card-text"><b>Travel Time:</b> {spot.travel_time}</p>
                        <p className="card-text text-muted" style={{ fontSize: "13px" }}>{spot.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3">
        &copy; {new Date().getFullYear()} Roamers. All rights reserved.
      </footer>
    </div>
  );
}
