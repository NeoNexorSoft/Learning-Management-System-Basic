"use client";

import { useState } from "react";

export default function SocialLoginLanguagePage() {
  const [form, setForm] = useState({
    google_enabled: false,
    google_client_id: "",
    google_client_secret: "",
    facebook_enabled: false,
    facebook_client_id: "",
    facebook_client_secret: "",
    language: "en",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("admin_token");

    await fetch("http://localhost:5000/api/admin/settings/social-language", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    alert("Saved from backend!");
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        Social Login & Language Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Google */}
        <div className="border p-4 rounded">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="google_enabled"
              onChange={handleChange}
            />
            Enable Google Login
          </label>

          <input
            className="mt-2 w-full border p-2"
            name="google_client_id"
            placeholder="Google Client ID"
            onChange={handleChange}
          />

          <input
            className="mt-2 w-full border p-2"
            name="google_client_secret"
            placeholder="Google Secret"
            onChange={handleChange}
          />
        </div>

        {/* Facebook */}
        <div className="border p-4 rounded">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="facebook_enabled"
              onChange={handleChange}
            />
            Enable Facebook Login
          </label>

          <input
            className="mt-2 w-full border p-2"
            name="facebook_client_id"
            placeholder="Facebook Client ID"
            onChange={handleChange}
          />

          <input
            className="mt-2 w-full border p-2"
            name="facebook_client_secret"
            placeholder="Facebook Secret"
            onChange={handleChange}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block mb-1">Language</label>
          <select
            className="border p-2 w-full"
            name="language"
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="bn">Bangla</option>
          </select>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Settings
        </button>
      </form>
    </div>
  );
}
