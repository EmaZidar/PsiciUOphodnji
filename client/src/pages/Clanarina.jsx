import React from 'react';
import './Clanarina.css';

export default function Clanarina() {
    //TODO: iz baze se ucita trenutna clanarina i mj i god i onda spemi u vaar i jos treba smislit kak ce gumbic radit
    const mjclanarina="";
    const godclanarina="";

    return(
        <>

        <main className='main'>
      <div className="admin-container">
          <div className="admin-header">
            <h1>Upravljanje članarinom</h1>
          </div>

          <div className="admin-content">
          
            <div className="upravljanje">    
              <h2> Mjesečna članarina</h2>
              <form action="/clanarina/mjesecna">
                <input type="submit" value="Promijeni" className='admin-btn' />
              </form>
            </div>

            <div className="upravljanje">    
              <h2>Godišnja članarina</h2>
              <form action="/clanarina/godisnja">
                <input type="submit" value="Promijeni" className='admin-btn' />
              </form>
            </div>

          </div>
        </div>
      </main>
        
        </>


    )
   

}