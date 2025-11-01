import React from "react";

export default function Feature({ title, text, btnText, bg }) {
  return (
    <section className="feature-section">
      <div className="feature-wrapper">
        <div className="feature-hero" style={{ backgroundImage: `url(${bg})` }}>
          <div className="partner-overlay">
            <div className="partner-content">
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
