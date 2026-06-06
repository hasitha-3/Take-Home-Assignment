import React from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import Navbar from "./Home/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <SearchX
          size={120}
          className="text-[var(--brand)] mx-auto mb-4 opacity-50"
        />
        <h1 className="hero-title text-6xl text-[var(--text-primary)] mb-2">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--text-secondary)] mb-6">
          Page Not Found
        </h2>
        <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/home" className="btn btn-primary btn-lg">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
