import React, { useState, useEffect } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (blockedUntil && new Date() > blockedUntil) {
      setBlockedUntil(null);
      setAttempts(0);
      setError('');
    }
  }, [blockedUntil]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (blockedUntil && new Date() < blockedUntil) {
      setError("Too many attempts. Please try again later.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const isCorrect = email === "user@example.com" && password === "securepass";

    if (isCorrect) {
      setError('');
      alert("Login successful! 🎉");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() + 5);
        setBlockedUntil(blockUntil);
        setError("Too many failed attempts. Login is blocked for 5 minutes.");
      } else {
        setError(`Login failed. Attempt ${newAttempts} of 3.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-red-500 to-orange-600">
      <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-sm text-purple-100 mt-2">
            Sign in to continue optimizing your CV
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-purple-100">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-purple-100">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="text-red-200 bg-red-600/30 p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white rounded-md transition-all"
            disabled={blockedUntil && new Date() < blockedUntil}
          >
            {blockedUntil && new Date() < blockedUntil ? "Blocked" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;