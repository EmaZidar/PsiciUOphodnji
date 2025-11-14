import React from "react";

export default function Feature({ title, text, btnText, bg, align }) {

  const heroClass = `feature-hero ${align === 'center' ? 'align-center' : ''}`;
  return (
    <section className="feature-section">
      <div className="feature-wrapper">
        <div className={heroClass} style={{ backgroundImage: `url(${bg})` }}>
          <div className="partner-overlay">
            <div className={`partner-content ${align === 'center' ? 'center' : ''}`}>
              <h3>{title}</h3>
              <p>{text}</p>
              {btnText && (
                <div className="partner-cta">
                  <a className="btn primary" href="#become">
                    {btnText}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
