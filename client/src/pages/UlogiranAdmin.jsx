import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranAdmin.css';


export default function UlogiranAdmin({ user }) {
  return (
    <>
      <HeaderUlogiran />
    <main className='main'>
      <div className="admin-container">
          <div className="admin-header">
            <h1>Odaberite što želite pregledati ili mijenjati:</h1>
          </div>

          <div className="admin-content">
          
            <div className="upravljanje">
              <h2>Korisnici</h2>
              <p>Pregled svih vlasnika i šetača te mogućnost brisanja korisnika.</p>
              <form action="/korisnici">
                  <input type="submit" value="Upravljaj korisnicima" className="admin-btn"/>
              </form>
            </div>

            <div className="upravljanje">
              <h2>Članarina</h2>
              <p>Pregledajte trenutnu cijenu mjesečne i godišnje članarine koju šetači plaćaju.</p>
              <form action="/clanarina">
                  <input type="submit" value="Upravljaj članarinom" className="admin-btn"/>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
