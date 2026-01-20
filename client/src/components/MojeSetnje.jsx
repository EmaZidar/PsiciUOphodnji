import React, { useEffect, useState } from 'react';
import "./MojeSetnje.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function MojeSetnje(){


    const [loading, setLoading] = useState(true);
      const [user, setUser] = useState(null);
      const [error, setError] = useState(null);
        const [selectedImage, setSelectedImage] = useState(null);
      
      const [imagePreview, setImagePreview] = useState(null);
      const [uploading, setUploading] = useState(false);
    const[prosleSetnje,setprosle]=useState([])
    const[buduceSetnje,setbuduce]=useState([])


        useEffect(() => {
            const API = `${BACKEND_URL}/api/me`;
            fetch(API, { credentials: 'include' })
              .then((r) => {
                if (!r.ok) throw new Error('Not authenticated');
                return r.json();
              })
              .then((data) => {
                setUser(data.user ?? data.session ?? null);
                setLoading(false);
              })
              .catch((err) => {
                setError(err.message);
                setLoading(false);
              });
          }, []);

const idKorisnik= "1"; //user.idKorisnik ||
       useEffect(() => {
               const loadprosle = async () => {
                 try {
                   setLoading(true);
                   setError(null);
                   const response = await fetch('/api/prosleSetnje/${idKorisnik}', { 
                     method: 'GET',
                     credentials: 'include' });
                   if (!response.ok) throw new Error(`Server returned ${response.status}`);
                   const data = await response.json();
                   setprosle(Array.isArray(data) ? data : (data?.prosleSetnje ?? []));
                 } catch (err) {
                     setError(err.message || 'Greška pri dohvaćanju podataka');
                     setprosle([]);
                 } finally {
                     setLoading(false);
                 }
               };
           loadprosle();
         }, []);    
         
     useEffect(() => {
               const loadbuduce = async () => {
                 try {
                   setLoading(true);
                   setError(null);
                   const response = await fetch('/api/buduceSetnje/${idKorisnik}', { 
                     method: 'GET',
                     credentials: 'include' });
                   if (!response.ok) throw new Error(`Server returned ${response.status}`);
                   const data = await response.json();
                   setbuduce(Array.isArray(data) ? data : (data?.buduceSetnje ?? []));
                 } catch (err) {
                     setError(err.message || 'Greška pri dohvaćanju podataka');
                     setbuduce([]);
                 } finally {
                     setLoading(false);
                 }
               };
           loadbuduce();
         }, []);    
        
    const njegoveProsleSetnje=prosleSetnje || [{datum: "nema"}, { datum: "1.1.2000.",  recenzija: "-" },]
    const njegoveBuduceSetnje=buduceSetnje || [{datum: "nema"}, 
      { datum: "1.1.2026.",  otakazan: "0"}]


      const [prikaziFormu, setPrikaziFormu] = useState(false);


      const [recenzija, setrecenzija] = useState({
        fotografija: "",
        idRezervacija: "",
        idRecenzija:"",
        ocjena: "",
        tekst:""
      });
      
        function spremi(e) {
        setrecenzija({
          ...recenzija,
          [e.target.name]: e.target.value
        });
      }
      
      
      function handleSubmit(e) {
        e.preventDefault();
        fetch("http://localhost:8000/recenzija", {   //TODO link provjeri
          method: "POST",
          headers: {
          "Content-Type": "application/json"
        },
          body: JSON.stringify(recenzija)
        });
        setPrikaziFormu(false);
      }
      
      function odustani(){
        setPrikaziFormu(false)
        setrecenzija({
        fotografija: "",
        idRezervacija: "",
        idRecenzija:"",
        ocjena: "",
        tekst:""
      });
            setImagePreview(null);
            setSelectedImage(null);

      }
      
      function resetiraj(e){
        e.preventDefault();
        setrecenzija({
        fotografija: "",
        idRezervacija: "",
        idRecenzija:"",
        ocjena: "",
        tekst:""
      });
      setImagePreview(null);
      setSelectedImage(null);
      }
      
      function izbrisi(idRezervacija){
  fetch("http://localhost:8000/setnje/${idRezervacija}", {   // tu mozda napravi da se odma opet izrendera stranica pa ga nece bit sad
    method: "DELETE",
  });
}

      const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedImage);

    try {
      const response = await fetch('http://localhost:8000/api/upload-profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Greška pri učitavanju slike');

      const data = await response.json();
      if (data?.user) {
        setUser(data.user);
      } else {
        const userResponse = await fetch('http://localhost:8000/api/me', { credentials: 'include' });
        const userData = await userResponse.json();
        setUser(userData.user ?? userData.session ?? null);
      }
      setImagePreview(null);
      setSelectedImage(null);
      alert('Slika uspješno učitana!');
    } catch (err) {
      alert('Greška: ' + err.message);
    } finally {
      setUploading(false);
    }
  };
     
      const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Molimo odaberite JPG, JPEG ili PNG datoteku');
    }
  };
      
    return(
    <>
<div className="basSveSetnje">
<div className="sveSetnje">
    <h2>Moje prošle šetnje:</h2>
    
        {njegoveProsleSetnje.map((setnja)=>(

            <div className='jednaSetnja'>
            <h3>Šetnja</h3>
            <p>Datum: {setnja.datum}</p>
            <p>Recenzija: {setnja.recenzija}</p>
                        <button onClick={() => setPrikaziFormu(true)}> Ostavi recenziju</button>

        </div>
        

        ))}

        {prikaziFormu&&(<form onSubmit={handleSubmit} className="formazarecenziju">
            <label>Opis: </label>
            <input type="text" id="tekst" name="tekst"   value={recenzija.tekst}  onChange={spremi}></input><br></br>
            
            <label >Ocjena: </label>
            <input type="number" id="ocjena" name="ocjena" value={recenzija.ocjena}  onChange={spremi}></input><br></br>

            <div><label >Dodajte sliku: </label>
            <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageSelect}
                    value={recenzija.fotografija}
                  />      </div>
                    

        {imagePreview && (
                  <img
                    src={imagePreview}
                    style={{ width: "201px", marginTop: "10px" }}
                  />
                )}

        {selectedImage && (
                      <div>
                      <button onClick={handleImageUpload} disabled={uploading} >
                        Odaberi sliku
                      </button>
                      </div>
                    )}

<div>
            <button type="submit" >Ostavi recenziju</button>
            <button onClick={resetiraj} >Resetiraj</button>
            <button onClick={odustani} >Odustani</button>
</div>
        </form>)}
        
                    </div>


<div className="sveSetnje">
<h2>Moje buduće šetnje:</h2>
    
        {njegoveBuduceSetnje.map((setnja)=>(

        <div className='jednaSetnja'>
            <h3>Šetnja</h3>
            <p>Zakazana: {setnja.datum} </p>
            <button onClick={izbrisi(setnja.idRezervacija)}>Otkaži </button>

        </div>

        ))}
        
    </div>

</div>
    </>
    );
}