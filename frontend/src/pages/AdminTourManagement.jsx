import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminTourManagement() {
  const [places, setPlaces] = useState([]);
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState({
    placeId: "",
    tourDate: "",
    costPerPerson: "",
  });
  const [editingTour, setEditingTour] = useState(null);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  // Fetch tourist spots
  useEffect(() => {
    axios
      .get("http://localhost:5000/tourist-spots")
      .then((res) => setPlaces(res.data))
      .catch((err) => console.error("Failed to fetch places:", err));
  }, []);

  // Fetch existing tours
  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await axios.get("http://localhost:5000/tours");
      setTours(res.data);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
    }
  };

  // Handle form input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Create new tour
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/tours", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Tour arranged successfully!");
      setForm({ placeId: "", tourDate: "", costPerPerson: "" });
      fetchTours();
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "❌ Failed to arrange tour");
    }
  };

  // Set a tour to be edited
  const startEditing = (tour) => {
    setEditingTour(tour.Tour_id);
    setForm({
      placeId: tour.Place_id,
      tourDate: tour.Tour_date.split("T")[0], // ensure YYYY-MM-DD
      costPerPerson: tour.Cost_per_person,
    });
  };

  // Update tour
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/tours/${editingTour}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Tour updated successfully!");
      setEditingTour(null);
      setForm({ placeId: "", tourDate: "", costPerPerson: "" });
      fetchTours();
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "❌ Failed to update tour");
    }
  };

  // Delete tour
  const deleteTour = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      await axios.delete(`http://localhost:5000/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("🗑️ Tour deleted successfully!");
      fetchTours();
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "❌ Failed to delete tour");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-primary">Admin Tour Management</h2>

      {/* Create / Update Tour Form */}
      <form
        onSubmit={editingTour ? handleUpdate : handleSubmit}
        className="card p-4 shadow mb-5"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <select
          className="form-select mb-3"
          name="placeId"
          value={form.placeId}
          onChange={handleChange}
          required
        >
          <option value="">Select a Place</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.location}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="form-control mb-3"
          name="tourDate"
          value={form.tourDate}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          className="form-control mb-3"
          name="costPerPerson"
          placeholder="Cost per person"
          value={form.costPerPerson}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn btn-success w-100">
          {editingTour ? "Update Tour" : "Arrange Tour"}
        </button>
      </form>

      {msg && <p className="text-center">{msg}</p>}

      {/* List of Tours */}
      <h3 className="mt-5 mb-3 text-center text-secondary">Existing Tours</h3>
      <div className="row g-4">
        {tours.map((tour) => (
          <div key={tour.Tour_id} className="col-md-4">
            <div className="card shadow-sm h-100">
              <img
                src={tour.image_url}
                className="card-img-top"
                alt={tour.place_name}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5>{tour.place_name}</h5>
                <p>
                  <b>Date:</b> {new Date(tour.Tour_date).toDateString()}
                </p>
                <p>
                  <b>Cost:</b> ${tour.Cost_per_person}
                </p>
                <p>
                  <b>Enrolled:</b> {tour.Total_enrolled}
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => startEditing(tour)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteTour(tour.Tour_id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {tours.length === 0 && (
          <p className="text-center text-muted">No tours created yet.</p>
        )}
      </div>
    </div>
  );
}
