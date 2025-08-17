import React, { useState } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import { EarthCanvas } from "../canvas";
import { slideIn } from "../../utils/motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "regenerator-runtime/runtime";

const SignIn = () => {
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
    
    // Check if form data is complete
    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Error...",
        text: "Please fill in both email and password!",
      });
      return;
    }

    console.log("Attempting login with:", { email: formData.email, password: formData.password });

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/auth/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      console.log("Login response status:", res.status);
      console.log("Login response data:", data);
      
      if (res.ok && data.success) {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${data.user?.name || 'User'}!`,
          showConfirmButton: false,
          timer: 1500
        });
        navigate("/quiz");
      } else {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials. Please try again.",
        });
      }
    } catch (error) {
      console.log("Login error:", error);
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
        <h3 className={styles.sectionHeadText}>Sign in</h3>

        <form className="mt-12 flex flex-col gap-8">
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
          <button
            type="submit"
            className="py-3 px-8 rounded-xl bg-red-600 w-fit text-black font-bold shadow-md shadow-primary hover:bg-red-400 transition-colors"
            onClick={handleSubmit}
          >
            {loading ? "Signin..." : "Sign In"}
          </button>
          
          <div className="flex flex-col gap-4 items-center mt-6">
            <p className="text-white text-center">Don't have an Account?</p>
            <button
              onClick={() => navigate("/signup")}
              className="py-3 px-8 rounded-xl bg-indigo-600 w-fit text-white font-bold shadow-md shadow-primary hover:bg-indigo-500 transition-colors"
            >
              Sign Up
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

export default SignIn;
