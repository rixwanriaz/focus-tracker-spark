import React from "react";

const SignupPage: React.FC = () => {
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

            <button
              type="submit"
              className="w-full py-2 rounded-md bg-pink-400 text-black font-medium hover:bg-pink-300 transition"
            >
              Sign up for free
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
            <a href="#" className="hover:underline">
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
