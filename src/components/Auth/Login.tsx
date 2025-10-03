import React from "react";

const LoginPage: React.FC = () => {
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
        <form className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                className="w-full mt-1 px-3 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                👁
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
            className="w-full py-2 rounded-md bg-pink-400 text-black font-medium hover:bg-pink-300 transition"
          >
            Log in via email
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
          <a href="#" className="hover:underline">
            Sign up for an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
