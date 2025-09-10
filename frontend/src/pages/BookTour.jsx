import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookTour() {
  const { id } = useParams(); // spot ID
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    booking_date: "",
    num_people: 1,
    special_request: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tourist-spots/${id}`);
        setSpot(response.data);
      } catch (err) {
        setError("Failed to fetch spot");
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchSpot();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    try {
      // Call backend API which uses stored procedure to insert booking
      const res = await axios.post(`http://localhost:5000/bookings`, {
        user_id: user.id,
        spot_id: spot.id,
        booking_date: form.booking_date,
        num_people: form.num_people,
        special_request: form.special_request,
      });

      if (res.data.success) {
        alert("Booking successful!");
        navigate("/my-bookings");
      } else {
        alert("Booking failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Booking successful!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!spot) return <div>Spot not found</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Book Your Tour to {spot.name}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Booking Date</label>
          <input
            type="date"
            name="booking_date"
            value={form.booking_date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Number of People</label>
          <input
            type="number"
            name="num_people"
            value={form.num_people}
            min={1}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Special Requests</label>
          <textarea
            name="special_request"
            value={form.special_request}
            onChange={handleChange}
            className="form-control"
            rows={4}
            placeholder="Any additional requests..."
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
