import { useState } from "react";
import axios from "axios";

export default function AddSpot() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    distance_from_current_location: "",
    estimated_travel_time: "",
    description: "",
    image_url: "",
  });
  const [msg, setMsg] = useState("");

  const categories = ["Beach", "Mountain", "City", "Forest", "Resort", "Desert"];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/tourist-spots", form);
      setMsg(res.data.message);
      setForm({
        name: "",
        category: "",
        location: "",
        distance_from_current_location: "",
        estimated_travel_time: "",
        description: "",
        image_url: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to add spot");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">Add a Tourist Spot</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <input
          className="form-control mb-3"
          name="name"
          placeholder="Place Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select
          className="form-select mb-3"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          className="form-control mb-3"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-3"
          name="distance_from_current_location"
          placeholder="Distance from current location (km)"
          value={form.distance_from_current_location}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-3"
          name="estimated_travel_time"
          placeholder="Estimated Travel Time"
          value={form.estimated_travel_time}
          onChange={handleChange}
        />

        <textarea
          className="form-control mb-3"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          className="form-control mb-3"
          name="image_url"
          placeholder="Image URL"
          value={form.image_url}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-primary w-100">
          Save Spot
        </button>
      </form>

      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
  );
}
