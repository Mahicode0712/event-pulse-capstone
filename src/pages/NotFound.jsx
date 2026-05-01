import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="p-8 text-center">
    <h1 className="mb-3 text-4xl font-bold">404</h1>
    <p className="mb-3">Page not found</p>
    <Link to="/" className="text-violet-600">
      Back to Home
    </Link>
  </div>
)

export default NotFound
