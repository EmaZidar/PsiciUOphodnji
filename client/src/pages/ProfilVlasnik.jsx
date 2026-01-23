import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './ProfilVlasnik.css';
import PodatciVlasnika from './podatciVlasnika';
import Psi from '../components/Psi';
import MojeSetnje from '../components/MojeSetnje';


export default function ProfilVlasnik(){
//dio za pse tu su izlistani
return(
<>
<PodatciVlasnika></PodatciVlasnika>

<h2>Moji psi: </h2>

<Psi></Psi>

<h2>Moje šetnje:</h2>
<MojeSetnje></MojeSetnje>

<Footer/>
</>);
}