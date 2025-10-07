import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { registerUser } from "@/redux/slice/authSlice";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    account_type: "team" as "team" | "individual",
    org_name: "",
  });
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }
    
    setShowPasswordField(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Validate organization name for team accounts
    if (formData.account_type === "team" && !formData.org_name?.trim()) {
      toast.error("Organization name is required for team accounts");
      return;
    }

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
      };

      if (formData.org_name?.trim()) {
        payload.org_name = formData.org_name.trim();
      }

      console.log("🚀 Sending registration request:", payload);
      const result = await dispatch(registerUser(payload)).unwrap();
      console.log("✅ Registration successful:", result);
      
      toast.success("Registration successful!");
      
      // Add 2-3 second delay with loader before navigation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      navigate("/timer");
    } catch (error: any) {
      console.error("❌ Registration failed - Full error:", error);
      console.error("❌ Error detail:", error?.detail);
      console.error("❌ Error message:", error?.message);
      
      // Better error message handling
      let errorMessage = "Registration failed. Please try again.";
      
      if (error?.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: any) => e.msg || e.message || e).join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        if (error.toLowerCase().includes('validation')) {
          errorMessage = "Validation error. Please check your input.";
        } else if (error.toLowerCase().includes('already')) {
          errorMessage = "This email is already registered.";
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

      {/* Signup Card */}
      <div className="relative w-full max-w-5xl bg-neutral-900 text-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-3xl font-bold text-pink-400">
            toggl <span className="text-gray-200 font-normal">track</span>
          </h1>
          <p className="mt-1 text-sm italic text-gray-400">
            Sign up and <span className="text-white">get tracking!</span>
          </p>

          <form className="mt-6 space-y-4" onSubmit={showPasswordField ? handleSubmit : handleEmailContinue}>
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
                disabled={showPasswordField}
              />
            </div>

            {showPasswordField && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm text-gray-300">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="account_type" className="block text-sm text-gray-300">
                    ACCOUNT TYPE
                  </label>
                  <select
                    id="account_type"
                    value={formData.account_type}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="team">Team</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>

                {formData.account_type === "team" && (
                  <div>
                    <label htmlFor="org_name" className="block text-sm text-gray-300">
                      ORGANIZATION NAME *
                    </label>
                    <input
                      type="text"
                      id="org_name"
                      value={formData.org_name}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="My Organization"
                      required
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowPasswordField(false)}
                  className="text-sm text-pink-400 hover:underline"
                >
                  ← Change email
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-pink-400 text-black font-medium hover:bg-pink-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : showPasswordField ? "Create account" : "Sign up for free"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-700" />
            <span className="px-2 text-sm text-gray-400">OR SIGN UP WITH</span>
            <hr className="flex-1 border-gray-700" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>
            <button className="flex-1 py-2 rounded-md bg-neutral-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-neutral-700 transition">
              <img
                src="https://www.svgrepo.com/show/475633/apple.svg"
                alt="Apple"
                className="w-5 h-5"
              />
              Apple
            </button>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-gray-400 leading-relaxed">
            Use of Toggl products is governed by their respective{" "}
            <a href="#" className="underline">
              Legal Terms and Policies
            </a>
            . By continuing, you confirm that you agree to all applicable Terms
            of Service and acknowledge the Privacy Policies for each product.
            You also agree to receive marketing emails from us, which you may
            unsubscribe from at any time.
          </p>

          {/* Existing Account Link */}
          <p className="mt-4 text-sm text-white">
            <a href="/login" className="hover:underline">
              Log in to an existing account
            </a>
          </p>
        </div>

        {/* Right Info Section */}
        <div className="w-full md:w-1/2 bg-neutral-900 border-l border-gray-800 p-8 flex flex-col justify-center text-center">
          <h2 className="text-2xl font-bold">
            Sign up for{" "}
            <span className="text-pink-400 italic font-semibold">free!</span>
          </h2>
          <p className="mt-2 text-gray-300">
            <span className="font-semibold italic">
              No credit card required.
            </span>{" "}
            Explore easy time tracking and powerful reporting.
          </p>

          {/* Testimonial */}
          <div className="mt-8 border border-pink-400 rounded-md p-6 relative">
            <span className="text-4xl text-pink-400 absolute top-2 left-2">
              “
            </span>
            <p className="text-gray-200 text-sm">
              Toggl Track has a very straightforward interface. It&apos;s easy
              to start, stop and edit time entries and to review your own work
              and the work of colleagues. It just works!
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Verified G2Crowd review. 5/5 stars.
            </p>
            {/* Power Button Icon */}
            <div className="absolute -bottom-8 right-8 w-16 h-16 rounded-full bg-pink-400 flex items-center justify-center text-black text-2xl font-bold">
              ⏻
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
