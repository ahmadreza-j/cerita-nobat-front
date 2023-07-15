import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.rtl.min.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
