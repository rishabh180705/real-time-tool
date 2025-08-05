import React, { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ email: '', password: '', name: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Login logic here
      console.log('Logging in with', formData);
    } else {
      // Signup logic here
      console.log('Signing up with', formData);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                required
                className="w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
              className="w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              required
              className="w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
