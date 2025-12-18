import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranSetac.css';

export default function UlogiranSetac({ user }) {
  return (
    <>
      <HeaderUlogiran />
      <main className="ulogiran-setac-main">
        <h1>Dobrodošli, Šetač!</h1>
      </main>
      <Footer />
    </>
  );
}
