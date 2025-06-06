export const getMilliseconds = (timeString: string) => {
  const unit = timeString.slice(-1)
  const value = parseInt(timeString.slice(0, -1))

  switch (unit) {
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      return value * 1000 // assume seconds if no unit
  }
}
