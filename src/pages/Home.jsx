import Hero from '../components/Hero'
import About from '../components/About'
import Featured from '../components/Featured'

export default function Home({ products }) {
  return (
    <main>
      <Hero />
      <About />
      <Featured products={products} />
    </main>
  )
}