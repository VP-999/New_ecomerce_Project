"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, setView } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (!success) {
      setError("Invalid email or password. (Hint: admin@trendhive.com / password, or user@example.com / password)")
    } else {
      setError("")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold tracking-wider cursor-pointer text-foreground"
          onClick={() => setView("store")}
        >
          TrendHive
        </h1>
        <p className="text-muted-foreground mt-2">Welcome back! Please sign in to continue.</p>
      </div>
      <div className="w-full max-w-sm bg-card p-8 rounded-lg shadow-md border border-border">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border border-input rounded w-full py-2 px-3 text-foreground bg-background leading-tight focus:outline-none focus:ring-primary focus:border-primary"
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border border-input rounded w-full py-2 px-3 text-foreground bg-background mb-3 leading-tight focus:outline-none focus:ring-primary focus:border-primary"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-destructive text-xs italic">{error}</p>}
          </div>
          <div className="flex flex-col items-center justify-between">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="submit"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="font-bold hover:underline text-foreground"
              >
                Register
              </button>
            </p>
          </div>
        </form>
        <button onClick={() => setView("store")} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Store
        </button>
      </div>
    </div>
  )
}

export default LoginPage
