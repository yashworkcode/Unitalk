export function notFound(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || 'Invalid data submitted.' })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || { field: 1 })[0]
    return res.status(409).json({ message: `That ${field} is already taken.` })
  }

  const status = err.status || 500
  res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : err.message })
}
