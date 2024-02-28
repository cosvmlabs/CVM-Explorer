import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const Connect = () => {
  const router = useRouter()
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // This code will only run in the browser environment
      window.localStorage.setItem(
        'https://cvm.cosvm.net',
        'https://cvm.cosvm.net'
      )
      window.location.reload()
    }
  }, [])

  return (
    <>
      <svg
        className="spinner"
        width="65px"
        height="65px"
        viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="path"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          cx="33"
          cy="33"
          r="30"
        ></circle>
      </svg>
    </>
  )
}

export default Connect
