import TopBar from '../components/TopBar'
import '../styles/home.css'

function Services() {
  return (
    <main className="home-page">
      <TopBar />

      <section className="services services-page" aria-labelledby="services-title">
        <div className="section-heading">
          <p className="eyebrow">Our Services</p>
          <h1 id="services-title">Choose the cut that fits your look</h1>
        </div>

        <div className="service-grid">
          <article className="service-card">
            <h2>Haircut</h2>
            <p>Clean, precise haircuts tailored to your style and hair type.</p>
          </article>

          <article className="service-card">
            <h2>Beard Trim</h2>
            <p>Shape and sharpen your beard for a polished, well-groomed finish.</p>
          </article>

          <article className="service-card">
            <h2>Haircut + Beard</h2>
            <p>A full grooming session with both haircut and beard service included.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Services