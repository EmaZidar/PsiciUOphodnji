import React from "react"; 

export default function Psi() {
  const Psi = []; // tu nekako s bekenda dobit te podatke
  return (
    <div className="sviPsi">
        {Psi.map((pas)=> (<div className="jedanPas"> 
            <h3 className="imePsa">{pas.ime}</h3>
            <p>Pasmina:{pas.pasmina}</p>
            <p>Godine: {pas.dob}</p>
            <p>Razina energije: {pas.energija}</p>
            <button>Izbriši psa</button>

         </div>))}
         <form className="dodajPsa">
            <label for="ime">Ime psa:</label>
            <input type="text" id="ime" name="ime"></input><br></br>
            <label for="pasmina">Pasmina:</label>
            <input type="text" id="pasmina" name="pasmina"></input><br></br>
            <label for="dob">Godine:</label>
            <input type="number" id="dob" name="dob"></input><br></br>
            <label for="energija">Razina energije:</label>
            <input type="text" id="energija" name="energija"></input><br></br>
            <button type="submit" value="Submit">Dodaj psa</button>
            <button type="reset" value="Reset">Resetiraj</button>
        </form>
    </div>    
    );
}
