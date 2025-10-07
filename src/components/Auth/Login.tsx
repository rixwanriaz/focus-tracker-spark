import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { loginUser } from "@/redux/slice/authSlice";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      
      console.log("🚀 Sending login request:", { email: payload.email });
      const result = await dispatch(loginUser(payload)).unwrap();
      console.log("✅ Login successful:", result);
      
      toast.success("Login successful!");
      navigate("/timer");
    } catch (error: any) {
      console.error("❌ Login failed - Full error:", error);
      console.error("❌ Error detail:", error?.detail);
      console.error("❌ Error message:", error?.message);
      
      // Better error message handling
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error?.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: any) => e.msg || e.message || e).join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        if (error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('401')) {
          errorMessage = "Invalid email or password.";
        } else if (error.toLowerCase().includes('validation')) {
          errorMessage = "Validation error. Please check your input.";
        } else if (error.toLowerCase().includes('network')) {
          errorMessage = "Cannot connect to server. Make sure the backend is running on http://localhost:8080";
        } else {
          errorMessage = error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white/5 rounded-full -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-10 right-10 w-1/3 h-1/3 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rotate-12" />
        <div className="absolute bottom-1/4 left-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white/5 rotate-45" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-neutral-900 text-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center text-pink-400">
          toggl <span className="text-gray-200 font-normal">track</span>
        </h1>
        <p className="text-center mt-1 text-sm italic text-gray-400">
          Log in and <span className="text-white">get tracking!</span>
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <span 
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <a
            href="#"
            className="text-sm text-pink-400 hover:underline block text-right"
          >
            Reset password
          </a>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-pink-400 text-black font-medium hover:bg-pink-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in via email"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-gray-700" />
          <span className="px-2 text-sm text-gray-400">OR LOG IN WITH</span>
          <hr className="flex-1 border-gray-700" />
        </div>

        {/* Social Logins */}
        <div className="space-y-3">
          <button className="w-full py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>
          <button className="w-full py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
            <img
              src="https://www.svgrepo.com/show/475633/apple.svg"
              alt="Apple"
              className="w-5 h-5"
            />
            Apple
          </button>
          <button className="w-full py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
            <span>🔑</span>
            Passkey
          </button>
          <button className="w-full py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
            ☁️ SSO
          </button>
        </div>

        {/* Signup */}
        <p className="text-center text-sm text-gray-400 mt-6">
          <a href="/signup" className="hover:underline">
            Sign up for an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
