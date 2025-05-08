import { LoginButton } from "../components/login-button";
import { EyeIcon, EyeOffIcon } from "lucide-react";


export const LoginPage = () => {
  return (
    <div className="flex items-center justify-center bg-white">
      <div className="bg-black bg-opacity-10 p-10 rounded-3xl w-[1100px] h-[600px] shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Log in</h1>
        <p className="text-center text-sm mb-6">
          Never been here? <a href="/sign-up" className="underline">Sign up</a>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
            />
            <span className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">
              <EyeOffIcon className="w-5 h-5" />
            </span>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input id="stayLoggedIn" type="checkbox" className="mr-2" />
          <label htmlFor="stayLoggedIn" className="text-sm">Stay logged in</label>
        </div>
        <div className="flex flex-col space-y-4">
          <LoginButton />
          <div className="text-center">
            <a href="#" className="text-sm underline text-gray-600">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}
