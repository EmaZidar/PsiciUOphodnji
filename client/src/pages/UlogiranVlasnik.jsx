import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranVlasnik.css';
import PrikazSetaca from './PrikazSetaca';

export default function UlogiranVlasnik({ user }) {
  return (
    <>
      <HeaderUlogiran />
      <main className="ulogiran-vlasnik-main">
        <h1>Dobrodošli, Vlasnik!</h1>
      </main>
      <PrikazSetaca />
      <Footer />
    </>
  );
}
