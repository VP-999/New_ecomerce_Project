"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset, setView } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = requestPasswordReset(email.trim(), password || "password")
    if (ok) {
      setMessage("Password reset successful. You can now log in.")
      setTimeout(() => setView("login"), 1200)
    } else {
      setMessage("No account found for this email.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-1">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-6">Reset your password to access your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for default"
              className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded font-semibold">Reset password</button>
          {message && <p className="text-sm text-center text-muted-foreground mt-2">{message}</p>}
        </form>
        <button onClick={() => setView("login")} className="w-full mt-4 text-sm text-primary">Back to login</button>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
