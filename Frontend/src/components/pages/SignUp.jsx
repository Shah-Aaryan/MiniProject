import React, { useState } from "react";
import { motion } from "framer-motion";
import { EarthCanvas } from "../canvas";
import { slideIn } from "../../utils/motion";
import { useNavigate } from "react-router-dom";
import "regenerator-runtime/runtime";
import Swal from 'sweetalert2'


const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    if (!formData.name || !formData.age || !formData.email || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Error...",
        text: "All fields are required!",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/api/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      console.log("Registration response:", data);
      
      if (res.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "User Registered Successfully",
          text: "Welcome! You can now login with your credentials.",
          showConfirmButton: false,
          timer: 2000
        });
        setLoading(false);
        navigate("/signin"); // Redirect to login page instead of quiz
      } else {
        setLoading(false);
        // Handle specific validation errors
        if (data.email && data.email.includes("already exists")) {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: "A user with this email already exists. Please use a different email or try logging in.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: "Please check your input and try again.",
          });
        }
      }
    } catch (error) {
      console.log("Registration error:", error);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error. Please check your connection and try again.",
      });
    }
  };

  return (
    <div
      className={`xl:mt-0 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden min-h-screen`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] p-8 rounded-2xl"
      >
        <h3 className="font-semibold text-4xl my-10 text-center">User Registration</h3>

        <form className="mt-12 flex flex-col gap-8">
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Name</span>
            <input
              type="text"
              id="name"
              placeholder="What's your name?"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-white rounded border font-medium"
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Age</span>
            <input
              type="text"
              id="age"
              placeholder="What's your Age?"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-white rounded border font-medium"
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your email</span>
            <input
              type="email"
              id="email"
              placeholder="What's your email?"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-white rounded border font-medium"
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Password</span>
            <input
              type="password"
              id="password"
              placeholder="your Password?"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-white rounded border font-medium"
              onChange={handleChange}
            />
          </label>

          <div className="flex flex-row justify-center">
            <button
              type="submit"
              className="py-3 px-8 rounded-xl bg-red-600 w-fit text-black font-bold shadow-md shadow-primary hover:bg-red-400 transition-colors"
              onClick={handleSubmit}
            >
              {loading ? "Register..." : "Register"}
            </button>
          </div>

          <div className="flex flex-col gap-4 items-center mt-6">
            <p className="text-white text-center">Already have an Account?</p>
            <button
              onClick={() => navigate("/signin")}
              className="py-3 px-8 rounded-xl bg-indigo-600 w-fit text-white font-bold shadow-md shadow-primary hover:bg-indigo-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SignUp;
