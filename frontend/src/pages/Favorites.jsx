import { useEffect, useState } from "react";
import axios from "axios";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5000/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setFavorites(res.data))
    .catch(err => {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please log in to view favorites");
      }
    });
  }, []);

  return (
    <div className="container py-5">
      <h2>My Favorite Places</h2>
      <div className="row">
        {favorites.map(fav => (
          <div key={fav.id} className="col-md-4 mb-3">
            <div className="card shadow-sm">
              <img src={fav.image_url} alt={fav.name} className="card-img-top" style={{height: "200px", objectFit: "cover"}} />
              <div className="card-body">
                <h5>{fav.name}</h5>
                <p>{fav.location}</p>
                <span className="badge bg-primary">{fav.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}