import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginSuccess } from '../features/auth/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(loginSuccess({ email: form.email, name: form.email.split('@')[0] }))
    toast.success('Login success')
    navigate('/saved')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full rounded border px-3 py-2" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full rounded bg-violet-600 py-2 text-white">Login</button>
      </form>
      <p className="mt-3 text-sm">
        New user? <Link to="/register" className="text-violet-600">Register</Link>
      </p>
    </div>
  )
}

export default Login
