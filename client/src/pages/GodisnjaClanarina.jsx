import React from 'react';
import './Clanarina.css';

export default function GodisnjaClanarina() {
	
	const godisnje = [
		{ id: 1, naziv: 'Godišnja Standard', cijena: '500kn' },
		{ id: 2, naziv: 'Godišnja Premium', cijena: '900kn' },
	];

	return (
		<div className="clanarina-page">
			<h3>Godišnje članarine</h3>
			<div className="clanarina-list">
				{godisnje.map((c) => (
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
