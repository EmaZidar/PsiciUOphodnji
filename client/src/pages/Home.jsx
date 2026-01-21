import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import Feature from '../components/Feature';
import Footer from '../components/Footer';
import './Home.css';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Steps />

        <Feature
          title="Postani šetač"
          text="Objavi termine šetnji i zaradii"
          bg="images/mother-her-daughter-playing-with-dog-family-autumn-park-pet-domestic-animal-lifestyle-concept.jpg"
        />

        <Feature
          title="Za pse"
          text="Prošetan pas je sretan pas :)"
          bg="images/dog-5671778_1280.jpg"
        />

      

        <Feature
          title="Odlično za vlasnike pasa"
          text="Pronađi idealnog šetača prema lokaciji, cijeni i ocjeni korisnika. Primaj obavijesti o novim šetačima i rezerviraj šetnju u par klikova."
          bg="images/dog-6977210_1280.jpg"
          align="center"
        />

      

        <Feature
          title="Fleksibilno radno vrijeme"
          text="Odaberi svoje radno vrijeme i raspored"
          bg="images/dog-5521309_1280.jpg"
          align="center"
        />
      </main>
      <Footer />
    </>
  );
}
