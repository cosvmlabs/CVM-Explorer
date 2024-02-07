import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Connect = () => {
  const router = useRouter();

  useEffect(() => {
    // Set item in local storage when component mounts
    window.localStorage.setItem('https://cvm.cosvm.net', 'https://cvm.cosvm.net');

    // Redirect to home page
    router.push('/');
  }, [router]);

  // Render nothing, as the page should be empty
  return null;
}

export default Connect;
