import React from 'react';
import './Clanarina.css';

export default function MjesecnaClanarina() {
	const mjesecne = [
		{ id: 1, naziv: 'Mjesečna A', cijena: '50kn' },
		{ id: 2, naziv: 'Mjesečna B', cijena: '80kn' },
	];

	return (
		<div className="clanarina-page">
			<h3>Mjesečne članarine</h3>
			<div className="clanarina-list">
				{mjesecne.map((c) => (
					<div className="clanarina-item" key={c.id}>
						<span className="clanarina-naziv">{c.naziv}</span>
						<span className="clanarina-cijena">{c.cijena}</span>
						<button style={{ marginLeft: 12 }}>Uredi</button>
						<button style={{ marginLeft: 8 }}>Obriši</button>
					</div>
				))}
			</div>
		</div>
	);
}
