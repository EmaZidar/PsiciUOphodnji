import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './Profile.css';
import Profile from './Profile';
import Psi from '../components/Psi';
import MojeSetnje from '../components/MojeSetnje';
import './ProfilVlasnik.css';


export default function ProfilVlasnik(){
//dio za pse tu su izlistani
return(
<>
<Profile></Profile>

<h2>Moji psi: </h2>

<Psi></Psi>

<h2>Moje šetnje:</h2>
<MojeSetnje></MojeSetnje>

<Footer/>
</>);
}