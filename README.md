# Pawpal 🐾

# Opis projekta

Studentski projekt iz kolegija Programsko inženjerstvo. Aplikacija “PawPal” s ciljem demonstracije principa timskog rada, verzioniranja i primjene softverskog inženjerstva u praksi.
Vlasnici pasa često nemaju  dovoljno vremena za šetnju pasa te kako bi lakše pronašli provjerene šetače pasa razvijamo platformu koja vlasnicima omogućava pronalaženje provjerenih šetača u njihovoj blizini, rezervaciju termina i plaćanje usluge. Također, registrianim šetačima pasa daje jednostavan pregled vlasnika za koje mogu obavljati plaćenu uslugu šetnje.
Suradnjom na ovom projektu željeli bismo unaprijediti naše vještine rada u timu komunikacijom i dobrom raspodjelom poslova te usavršiti i praktično primijeniti do sada naučena znanja iz nekoliko kolegija prošlih godina.

# Funkcijski zahtjevi

Vlasnici pasa mogu filtrirati šetače po cijeni, udaljenosti i ocjeni
Za pregled i rezervaciju termina koristi se vanjska usluga kalendara (Google calendar)
Prilikom rezervacije vlasnik odabire: datum, vrijeme, trajanje šetnje, tip šetnje (individualna/grupna), polazišnu adresu te dodaje eventualne napomene
Nakon potvrde vlasnik i šetač mogu komunicirati u chat-u
Vlasnici se mogu pretplatiti na obavijesti o novim šetačima
Registracija i prijava korisnika je ostvarena pomoću OAuth 2.0
I šetači i vlasnici imaju svoj javni profil s osobnim podatcima i dodatnim podatcima ovisno o svojoj ulozi


# Tehnologije
JavaScript, Node.js, Express, HTML5, CSS3, React, Render, PostgreSQL

# Članovi tima
Viktor Wilder, Nina Zamberlin, Ema Zidar, Leonard Zadro, Luka Zadro, Jakov Ramljak, Lana Šapić

# Contributing Guide – Timske uloge i odgovornosti

Ova tablica prikazuje članove tima, njihove uloge i detaljne odgovornosti u projektu. Cilj je jasnoća i profesionalna organizacija.

| Član tima      | Uloga u timu             | Odgovornosti                                                                 |
|----------------|-------------------------|-----------------------------------------------------------------------------|
| **Ema Zidar**  | Voditeljica tima, Frontend & Dizajn | - Koordinacija cijelog tima<br>- Planiranje i raspodjela zadataka<br>- Frontend razvoj i dizajn korisničkog sučelja<br>- Pregled i odobravanje pull requestova<br>- Održavanje vizualnog identiteta projekta<br>- Praćenje napretka tima i rokova |
| **Jakov Ramljak** | Frontend & Dizajn      | - Razvoj frontend funkcionalnosti<br>- Implementacija dizajna i UX elemenata<br>- Suradnja s Emom na vizualnom identitetu<br>- Sudjelovanje u code review procesima<br>- Testiranje korisničkog sučelja |
| **Nina Zamberlin** | Baza podataka & Dizajn  | - Projektiranje baze podataka<br>- Implementacija i održavanje schema i tabela<br>- Suradnja na dizajnu aplikacije<br>- Dokumentacija strukture baze<br>- Optimizacija upita i performansi baze |
| **Lana Šapić** | Baza podataka & Backend   | - Razvoj backend funkcionalnosti<br>- Integracija baze podataka s aplikacijom<br>- Pisanje API endpointa<br>- Testiranje backend logike<br>- Dokumentiranje backend procesa |
| **Luka Zadro** | Backend developer         | - Razvoj backend modula i servisa<br>- Implementacija poslovne logike<br>- Suradnja s Lanom i Leonardom<br>- Pisanje testova i debugging<br>- Održavanje stabilnosti koda |
| **Leonard Zadro** | Backend & Autorizacija (OAuth 2.0) | - Implementacija backend modula<br>- Upravljanje autorizacijom i autentikacijom<br>- Integracija OAuth 2.0 sustava<br>- Sigurnosne provjere i kontrola pristupa<br>- Suradnja s timom na backend arhitekturi |
| **Viktor Wilder** | Frontend developer       | - Razvoj frontend funkcionalnosti<br>- Implementacija dizajnerskih smjernica<br>- Sudjelovanje u code review procesu<br>- Suradnja s Emom i Jakovom<br>- Testiranje i optimizacija korisničkog sučelja |


## 🙂 Kodeks ponašanja

### Naša obaveza
- Poštovati sve članove tima i njihove ideje.
- Komunicirati profesionalno i konstruktivno.
- Dijeliti odgovornosti i jasno definirati zadatke.
- Pridržavati se etičkih i akademskih pravila.

### Prihvatljivo ponašanje
- Davanje konstruktivnih komentara na kod i dokumentaciju.
- Traženje i pružanje pomoći članovima tima.
- Jasno dogovaranje tko radi što i kada.
- Privatno rješavanje problema kada je moguće.

### Neprihvatljivo ponašanje
- Uvrede, agresivan ton, javno ponižavanje.
- Diskriminacija ili govor mržnje.
- Plagijat ili preuzimanje tuđeg rada.
- Namjerno ometanje rada tima.
- Odmazda protiv osobe koja prijavi incident.

### Organizacija tima
- Jasno definirati uloge i odgovornosti (README ili Projects board).
- Koristiti GitHub Projects/issue oznake za praćenje zadataka.
- Dogovoriti redovitu komunikaciju (standup, status poruke, code review).
- Sporove pokušati rješavati privatno prije eskalacije.

### Prijava problema
Ako se pojavi problem:
1. Pokušajte privatno razgovarati s osobom.  
2. Ako ne uspije, kontaktirajte asistenta ili voditelja tima.  
3. Za ozbiljne incidente (uznemiravanje, plagijat), pošaljite e-mail.

**Primjer kontakta:**  
- Asistentica: iva.sovic@fer.hr  
- Demos: mislav.markusic@fer.hr  
- Repo kontakt: ema.zidar@fer.hr  

U prijavi navedite kratak opis, datum i vrijeme, sudionike, dokaze i željeni ishod.

### Posljedice kršenja
- Upozorenja i zahtjev za isprikom.
- Ograničenje pristupa repozitoriju.
- Uklanjanje doprinosa.
- Prijava fakultetskim tijelima u teškim slučajevima.


## 📝 Licenca

MIT License © 2025 Ema Zidar  

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
