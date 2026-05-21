import React from "react";

import { Link } from "react-router-dom";

function Navbar({ darkMode, setDarkMode }) {

  return (

    <div className="flex justify-between items-center mb-8">

      <h1 className="text-3xl font-bold">
        UrbanMind AI
      </h1>

      <div className="flex gap-4">

        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          Dashboard
        </Link>

        <Link
          to="/chat"
          className="bg-green-500 text-white px-4 py-2 rounded-xl"
        >
          AI Chat
        </Link>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

      </div>

    </div>

  );
}

export default Navbar;