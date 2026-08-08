import React, { useState } from "react";
import notify from '../utils/notify';
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import "./register.css"; // CSS import

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return notify.error("Passwords do not match!");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      await API.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify.success("Registration successful! Please verify OTP.");
      navigate("/Login"); // ✅ Redirect to OTP page
    } catch (error) {
      notify.error(error.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="register-input"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            className="register-input"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="register-input"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="register-input"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="register-input"
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            className="register-input-file"
            onChange={handleChange}
          />
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
