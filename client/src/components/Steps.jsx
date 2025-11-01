import React from "react";

export default function Steps() {
  return (
    <section className="steps-section">
      <div className="steps-inner">
        <h3>Tri koraka do sretno umornog psa 🐕‍🦺</h3>
        <div className="steps-grid">
          <div className="step">
            <div className="step-icon">
              <img src="images/dog-1839808_1280.jpg" alt="dog" />
            </div>
            <h4>1️⃣ Registriraj se</h4>
            <p>Registriraj se kao vlasnik ili šetač</p>
          </div>

          <div className="step">
            <div className="step-icon">
              <img src="images/phone.png" alt="phone" />
            </div>
            <h4>2️⃣ Odaberi šetnju</h4>
            <p>Odaberi šetnju koja ti odgovara</p>
          </div>

          <div className="step">
            <div className="step-icon">
              <img src="images/wallet.png" alt="wallet" />
            </div>
            <h4>3️⃣ Plati i uživaj</h4>
            <p>Plati i uživaj u slobodnom vremenu</p>
          </div>
        </div>
      </div>
    </section>
  );
}
