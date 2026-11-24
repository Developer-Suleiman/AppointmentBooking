import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'
import '../styles/landing.css'

const SERVICES = [
  {
    name: 'Fade Cut',
    description: 'Precision-blended fades tapered to your exact preference, finished with a sharp line-up.',
    price: '$35',
    duration: '45 min',
  },
  {
    name: 'Beard Sculpting',
    description: 'Shape, trim, and define your beard with straight-razor detailing for a polished edge.',
    price: '$25',
    duration: '30 min',
  },
  {
    name: 'Hot Towel Shave',
    description: 'A traditional straight-razor shave with hot towel prep and finished with a cooling balm.',
    price: '$40',
    duration: '30 min',
  },
  {
    name: 'Cut & Beard Combo',
    description: 'The full package — a tailored haircut paired with beard sculpting in one visit.',
    price: '$55',
    duration: '60 min',
  },
]

const BARBERS = [
  {
    name: 'Marcus R.',
    role: 'Master Barber',
    specialty: 'Fades & Tapers',
    initials: 'MR',
  },
  {
    name: 'Mark C.',
    role: 'Senior Barber',
    specialty: 'Beard Sculpting',
    initials: 'EC',
  },
  {
    name: 'Jordan B.',
    role: 'Barber',
    specialty: 'Classic Cuts & Shaves',
    initials: 'JB',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Best fade I have had in years. The attention to detail is next level and the shop has a great vibe.',
    name: 'David O.',
    context: 'Regular customer',
  },
  {
    quote: 'The hot towel shave is worth it alone. Booking online took two minutes and I was in the chair on time.',
    name: 'John S.',
    context: 'First-time client',
  },
  {
    quote: 'Marcus always knows exactly what I want. Consistent, sharp, professional every single visit.',
    name: 'Tunde A.',
    context: 'Regular customer',
  },
]

function StarRating() {
  return (
    <div className="star-rating" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden="true">★</span>
      ))}
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const { authState, logout } = useAuthStatus()
  const [presetService, setPresetService] = useState('')

  const isAdmin = authState.status === 'authenticated' && authState.role === 'admin'
  const isCustomer = authState.status === 'authenticated' && authState.role !== 'admin'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function handleQuickBooking(event) {
    event.preventDefault()
    navigate('/book', { state: { service: presetService } })
  }

  return (
    <div className="landing-page">
      <nav className="navbar navbar-expand-lg navbar-dark landing-navbar fixed-top">
        <div className="container">
          <Link className="navbar-brand landing-brand" to="/">
            FreshCut <span className="text-gold">Barbers</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#landingNav"
            aria-controls="landingNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/book">Book Now</Link></li>

              {isCustomer ? (
                <li className="nav-item"><Link className="nav-link" to="/account">My Account</Link></li>
              ) : null}
              {isAdmin ? (
                <li className="nav-item"><Link className="nav-link" to="/admin">Admin Dashboard</Link></li>
              ) : null}
              {authState.status === 'guest' ? (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/login">Sign In</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/admin/login">Admin</Link></li>
                </>
              ) : null}
              {authState.status === 'authenticated' ? (
                <li className="nav-item">
                  <button type="button" className="btn btn-link nav-link nav-signout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container position-relative">
          <div className="row justify-content-center justify-content-lg-start text-center text-lg-start">
            <div className="col-lg-8 col-xl-7">
              <p className="eyebrow-gold">Precision Grooming Since Day One</p>
              <h1 className="hero-title">
                Precision Cuts. <span className="text-gold">Classic Style.</span>
              </h1>
              <p className="hero-lead">
                FreshCut Barbers pairs sharp modern fades with timeless barbershop
                craft — book a chair with our master barbers in minutes.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start hero-actions">
                <Link to="/book" className="btn btn-gold btn-lg px-4">Book Appointment</Link>
                <a href="#services" className="btn btn-outline-light btn-lg px-4">View Services</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-section" id="services" aria-labelledby="services-title">
        <div className="container">
          <div className="section-heading text-center mx-auto">
            <p className="eyebrow-gold">Our Services</p>
            <h2 id="services-title">Choose the cut that fits your look</h2>
          </div>

          <div className="row g-4">
            {SERVICES.map((service) => (
              <div className="col-md-6 col-lg-3" key={service.name}>
                <article className="service-card-landing h-100">
                  <span className="duration-badge">{service.duration}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <p className="price-tag">{service.price}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="barbers" aria-labelledby="barbers-title">
        <div className="container">
          <div className="section-heading text-center mx-auto">
            <p className="eyebrow-gold">Meet The Team</p>
            <h2 id="barbers-title">Barbers who know their craft</h2>
          </div>

          <div className="row g-4">
            {BARBERS.map((barber) => (
              <div className="col-md-6 col-lg-4" key={barber.name}>
                <article className="barber-card h-100">
                  <div className="barber-avatar">{barber.initials}</div>
                  <h3>{barber.name}</h3>
                  <p className="barber-role">{barber.role}</p>
                  <p className="barber-specialty">{barber.specialty}</p>
                  <div className="barber-socials">
                    <a href="#top" aria-label={`${barber.name} on Instagram`}>IG</a>
                    <a href="#top" aria-label={`${barber.name} on X`}>X</a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="booking-banner" aria-labelledby="booking-banner-title">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <p className="eyebrow-gold">Ready When You Are</p>
              <h2 id="booking-banner-title">Reserve your next appointment now</h2>
              <p className="booking-banner-copy">
                Pick a service and a time that works for you — we will lock in the details on the booking page.
              </p>
            </div>
            <div className="col-lg-7">
              <form className="quick-booking-form row g-3" onSubmit={handleQuickBooking}>
                <div className="col-sm-8">
                  <label className="form-label" htmlFor="quick-service">Service</label>
                  <select
                    id="quick-service"
                    className="form-select"
                    value={presetService}
                    onChange={(event) => setPresetService(event.target.value)}
                  >
                    <option value="">Any service</option>
                    <option value="Haircut">Haircut</option>
                    <option value="Beard Trim">Beard Trim</option>
                    <option value="Haircut + Beard">Haircut + Beard</option>
                  </select>
                </div>
                <div className="col-sm-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-gold btn-lg w-100">Check Availability</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="testimonials" aria-labelledby="testimonials-title">
        <div className="container">
          <div className="section-heading text-center mx-auto">
            <p className="eyebrow-gold">Social Proof</p>
            <h2 id="testimonials-title">What our clients say</h2>
          </div>

          <div id="testimonialCarousel" className="carousel slide testimonial-carousel" data-bs-ride="carousel">
            <div className="carousel-inner">
              {TESTIMONIALS.map((testimonial, index) => (
                <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={testimonial.name}>
                  <div className="testimonial-card mx-auto">
                    <StarRating />
                    <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-context">{testimonial.context}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer" id="top">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <p className="footer-brand">FreshCut <span className="text-gold">Barbers</span></p>
              <p className="footer-copy">Modern cuts, classic service. Sharp styling and easy appointments that fit your schedule.</p>
            </div>
            <div className="col-md-4">
              <h3 className="footer-heading">Operating Hours</h3>
              <ul className="footer-list">
                <li><span>Tue – Fri</span><span>09:00 – 18:00</span></li>
                <li><span>Saturday</span><span>10:00 – 17:00</span></li>
                <li><span>Sun – Mon</span><span>Closed</span></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h3 className="footer-heading">Visit Us</h3>
              <p className="footer-copy">
                12 Barber Lane, Dublin, Ireland
                <br />
                <a
                  className="footer-link"
                  href="https://www.google.com/maps/search/?api=1&query=Barber+Lane+Dublin"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              </p>
              <div className="footer-socials">
                <a href="#top" aria-label="FreshCut Barbers on Instagram">Instagram</a>
                <a href="#top" aria-label="FreshCut Barbers on Facebook">Facebook</a>
              </div>
            </div>
          </div>
          <p className="footer-bottom">© {new Date().getFullYear()} FreshCut Barbers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home