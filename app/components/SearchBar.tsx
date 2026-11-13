"use client";

import { useState, type FormEvent } from "react";

type SearchBarProps = {
  onSearch: (city: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCity = city.trim();
    if (normalizedCity) onSearch(normalizedCity);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="input-shell">
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Şehir adı (İzmir, Paris...)"
          aria-label="Şehir ara"
          autoComplete="off"
          maxLength={100}
          required
        />
        <button
          type="submit"
          className="primary-button text-sm"
          disabled={!city.trim()}
        >
          Sorgula
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
