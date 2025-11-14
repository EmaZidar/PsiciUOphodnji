import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import Feature from '../components/Feature';
import Footer from '../components/Footer';
import './Home.css';

export default function HomeUlogiran() {
  return (
    <>
      <HeaderUlogiran />
      <main>
        <Hero />
        <section style={{padding: '32px 18px'}}>
          <h2>Dobrodošli nazad!</h2>
          <p>Ovo je glavna stranica za prijavljene korisnike. Kliknite na ikonu u gornjem desnom kutu za pregled profila.</p>
        </section>

        <Steps />

        <Feature
          title="Postani partner šetač"
          text="Zaradi šećući u svom mjestu. Odredi vlastito radno vrijeme i dostavljaj kada i gdje želiš."
          btnText="Postani šetač"
          bg="images/mother-her-daughter-playing-with-dog-family-autumn-park-pet-domestic-animal-lifestyle-concept.jpg"
        />

      </main>
      <Footer />
    </>
  );
}
