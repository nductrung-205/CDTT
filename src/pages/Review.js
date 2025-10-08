import React, { useState } from "react";
import { postReview } from "../api/axios";

function Review() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postReview({ name, rating, comment });
      setSuccess("✅ Cảm ơn bạn đã đánh giá!");
      setName("");
      setRating(5);
      setComment("");
    } catch (err) {
      console.error(err);
      setSuccess("❌ Gửi đánh giá thất bại, thử lại!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 mt-12">
      <h2 className="text-2xl font-bold mb-4 text-center text-orange-600">
        ✨ Đánh giá món ăn
      </h2>

      {success && <p className="text-center mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="5">⭐ 5 sao</option>
          <option value="4">⭐ 4 sao</option>
          <option value="3">⭐ 3 sao</option>
          <option value="2">⭐ 2 sao</option>
          <option value="1">⭐ 1 sao</option>
        </select>

        <textarea
          placeholder="Viết cảm nhận của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded"
          rows="4"
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
}

export default Review;
