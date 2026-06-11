import React from "react";
import { Link } from "react-router-dom";
<Link to="/map">Live Map</Link>

function HomePage() {

  return (

    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* NAVBAR */}

      <nav className="flex justify-between items-center px-10 py-6 border-b border-gray-800 backdrop-blur-lg">

        <h1 className="text-3xl font-bold tracking-wide text-cyan-400">
          UrbanMind AI
        </h1>

        <div className="flex gap-6 text-gray-300">

          <Link to="/dashboard" className="hover:text-cyan-400 transition">
            Dashboard
          </Link>

          <Link to="/chat" className="hover:text-cyan-400 transition">
            AI Assistant
          </Link>

          <Link to="/map" className="hover:text-cyan-400 transition">
            Live Map
          </Link>

        </div>

      </nav>

      {/* HERO SECTION */}

      <div className="relative flex flex-col justify-center items-center text-center px-6 py-32">

        {/* GLOW EFFECTS */}

        <div className="absolute w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full top-10 left-10 animate-pulse"></div>

        <div className="absolute w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10 animate-pulse"></div>

        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight z-10">

          AI Powered <br />

          <span className="text-cyan-400">
            Smart City Intelligence
          </span>

        </h1>

        <p className="mt-8 text-gray-300 text-xl max-w-3xl z-10 leading-9">

          Real-time weather monitoring, AI travel insights,
          traffic intelligence, and futuristic smart city assistance.

        </p>

        <div className="flex gap-6 mt-12 z-10">

          <Link
            to="/dashboard"
            className="bg-cyan-500 hover:bg-cyan-600 px-8 py-4 rounded-2xl text-lg font-semibold transition duration-300 shadow-lg shadow-cyan-500/30"
          >
            Launch Dashboard
          </Link>

          <Link
            to="/chat"
            className="border border-cyan-400 hover:bg-cyan-500/10 px-8 py-4 rounded-2xl text-lg transition duration-300"
          >
            Try AI Assistant
          </Link>

        </div>

      </div>

      {/* FEATURES */}

      <div className="grid md:grid-cols-3 gap-8 px-10 pb-24">

        <div className="bg-[#111827] p-8 rounded-3xl border border-gray-800 hover:border-cyan-500 transition">

          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            AI Travel Assistant
          </h2>

          <p className="text-gray-300 leading-7">
            Intelligent travel recommendations based on
            weather, traffic risk, and smart routing.
          </p>

        </div>

        <div className="bg-[#111827] p-8 rounded-3xl border border-gray-800 hover:border-cyan-500 transition">

          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            Live City Monitoring
          </h2>

          <p className="text-gray-300 leading-7">
            Monitor cities in real-time with weather analysis,
            traffic insights, and AI-generated alerts.
          </p>

        </div>

        <div className="bg-[#111827] p-8 rounded-3xl border border-gray-800 hover:border-cyan-500 transition">

          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            Smart Urban Intelligence
          </h2>

          <p className="text-gray-300 leading-7">
            Advanced AI-powered smart city platform
            designed for futuristic urban assistance.
          </p>

        </div>

      </div>

    </div>
  );
}

export default HomePage;
