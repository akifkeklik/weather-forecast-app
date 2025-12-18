"use client";
import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(city);
      }}
      className="w-full"
    >
      <div className="input-shell">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Şehir adı (İzmir, Paris...)"
          aria-label="Şehir ara"
        />
        <button type="submit" className="primary-button text-sm">
          Sorgula
          <span>↗</span>
        </button>
      </div>
    </form>
  );
}
