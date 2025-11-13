import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import Feature from '../components/Feature';
import Footer from '../components/Footer';
import './home.css';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Steps />

        <Feature
          title="Postani partner šetač"
          text="Zaradi šećući u svom mjestu. Odredi vlastito radno vrijeme i dostavljaj kada i gdje želiš."
          btnText="Postani šetač"
          bg="images/mother-her-daughter-playing-with-dog-family-autumn-park-pet-domestic-animal-lifestyle-concept.jpg"
        />

        <Feature
          title="Za pse"
          text="Učini svog psa sretnijim. Pronađi provjerene šetače, rezerviraj termin i osiguraj svom ljubimcu više aktivnosti i pažnje."
          btnText="Pronađi šetača"
          bg="images/dog-5671778_1280.jpg"
        />

        <section className="dog-tagline-section">
          <div className="dog-tagline-inner">
            <h2>PSI SU POSLUŠNIJI UZ PAWPal</h2>
            <p className="tagline-sub">brzo, pouzdano i povoljno</p>
          </div>
        </section>

        <Feature
          title="Za vlasnike pasa"
          text="Pouzdani šetači, provjerene recenzije, potpuna kontrola. Pronađi idealnog šetača prema lokaciji, cijeni i ocjeni korisnika. Primaj obavijesti o novim šetačima i rezerviraj šetnju u par klikova."
          bg="images/dog-6977210_1280.jpg"
        />

        <Feature
          title="Zarada za šetače"
          text="Što više šetaš, to više zarađuješ. Poveži se s vlasnicima u svom gradu, objavi termine i naplati svoje usluge jednostavno i sigurno."
          bg="images/beautiful-couple-spend-time-summer-city.jpg"
        />

        <Feature
          title="Fleksibilno radno vrijeme"
          text="Odaberi svoje radno vrijeme i raspored. Radi kada želiš i provodi slobodno vrijeme među svojim čupavim prijateljima."
          bg="images/dog-5521309_1280.jpg"
        />
      </main>
      <Footer />
    </>
  );
}
