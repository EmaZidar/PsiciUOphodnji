import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranSetac.css';
import Appointments from '../components/Appointments';
import SetnjeSetacu from '../components/SetnjeSetacu';

export default function UlogiranSetac({ user }) {
  const userId =
    user &&
    (user._id ||
      user.id ||
      user.idKorisnik ||
      user.idkorisnik);

  return (
    <>
      <HeaderUlogiran />

      <main className="ulogiran-setac-main">
        <div className="setac-container">
          <div className="welcome-card">
            <h1>Dobrodošli!</h1>
            <p className="muted">Ovime upravljate svojim terminima šetnje.</p>

            <div className="dashboard-main">
              <Appointments userId={userId} showHeader={false} />

              {userId && (
                <section className="moje-setnje">
                  <h2>Moje buduće šetnje</h2>
                  <SetnjeSetacu userId={userId} />
                </section>
              )}
            </div>
          </div>

          <aside className="dashboard-side" />
        </div>
      </main>

      <Footer />
    </>
  );
}
