import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 text-center">
      <div className="text-7xl font-extrabold text-gray-200 leading-none mb-4">
        404
      </div>
      <h1 className="text-3xl font-extrabold mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you requested doesn’t exist.
      </p>

      <Link
        to="/"
        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-7 py-3 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
}
