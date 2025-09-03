import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch tourist spots
    axios
      .get("http://localhost:5000/tourist-spots")
      .then((res) => setSpots(res.data))
      .catch((err) => console.error(err));

    // Get logged in user info from localStorage or backend
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      axios
        .get("http://localhost:5000/auth/me", { withCredentials: true })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

  // Group spots by category
  const grouped = spots.reduce((acc, spot) => {
    if (!acc[spot.category]) acc[spot.category] = [];
    acc[spot.category].push(spot);
    return acc;
  }, {});

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">
            Roamers
          </a>
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
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About
                </a>
              </li>
            </ul>

            {/* Always show Login & Register */}
            <div className="ms-3 d-flex gap-2 align-items-center">
              <a href="/login" className="btn btn-outline-light">
                Login
              </a>
              <a href="/register" className="btn btn-light">
                Register
              </a>

              {/* Admin Add Spot button */}
              {user && user.role === "admin" && (
                <a
                  href="/add-spot"
                  className="btn btn-warning shadow-lg"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginLeft: "10px",
                  }}
                  title="Add Tourist Spot"
                >
                  +
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="hero text-white d-flex align-items-center"
        style={{
          backgroundImage:
            "url('https://internationaldriversassociation.com/cms-assets/original_images/Mountain_Valley_Reflections_w64hyIP.jpg')",
          height: "70vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container text-center">
          <h1 className="display-4 fw-bold text-shadow">Explore Bangladesh</h1>
          <p className="lead text-shadow">
            Discover the best tourist spots, beaches, mountains, and cities across Bangladesh.
          </p>
        </div>
      </section>

      {/* Tourist Spots */}
      <main id="tours" className="py-5">
        <div className="container" style={{ maxWidth: "1200px" }}>
          {Object.keys(grouped).map((category) => (
            <div key={category} className="mb-5">
              <h2 className="mb-4 text-center text-primary fw-bold">{category.toUpperCase()}</h2>
              <div className="row g-4 justify-content-center">
                {grouped[category].map((spot) => (
                  <div key={spot.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 shadow-sm rounded-4 border-0 hover-scale">
                      <img
                        src={spot.image_url}
                        className="card-img-top rounded-top-4"
                        alt={spot.name}
                        style={{ height: "180px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{spot.name}</h5>
                        <p className="card-text mb-1">
                          <b>Location:</b> {spot.location}
                        </p>
                        <p className="card-text mb-1">
                          <b>Distance:</b> {spot.distance} km
                        </p>
                        <p className="card-text mb-1">
                          <b>Travel Time:</b> {spot.travel_time}
                        </p>
                        <p
                          className="card-text text-muted"
                          style={{ fontSize: "13px" }}
                        >
                          {spot.description}
                        </p>
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
      <footer className="bg-primary text-white text-center py-3 mt-5">
        &copy; {new Date().getFullYear()} Roamers. All rights reserved.
      </footer>

      <style>{`
        .hover-scale:hover {
          transform: scale(1.03);
          transition: transform 0.3s ease-in-out;
        }
        .text-shadow {
          text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
