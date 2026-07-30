"use client";

import React, { useState } from 'react';
import './testimonials-styles.css';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="testimonials">
      <div className="testimonials-tag">
        <div className="testi-outer">
          <div className="testi-inner">
            <div className="testi-dot"></div>
            <span>Testimonials</span>
          </div>
        </div>
      </div>
      
      <div className="testi-layout">
        {/* LEFT SIDE */}
        <div className="testi-left">
        <h2 className="testi-heading">
          What Founders Are Saying About <br />
          LaunchPad Labs
        </h2>

        <div className="video-stack">
          {/* CARD 1 */}
          <div className={`video-card ${activeIndex === 0 ? 'active' : ''}`} onClick={() => setActiveIndex(0)}>
            <div className="video-thumb">
              <img src="/assets/Rectangle 2404.png" alt="Founder 1" />
              <div className="overlay"></div>
              <div className="play-btn"><div className="play-icon">▶</div></div>
              <div className="video-info">
                <h3>John Doe <span className="verified">✔</span></h3>
                <p>Software Developer</p>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className={`video-card ${activeIndex === 1 ? 'active' : ''}`} onClick={() => setActiveIndex(1)}>
            <div className="video-thumb">
              <img src="/assets/founder2.jpg" alt="Founder 2" />
              <div className="overlay"></div>
              <div className="play-btn"><div className="play-icon">▶</div></div>
              <div className="video-info">
                <h3>Sarah Johnson <span className="verified">✔</span></h3>
                <p>Startup Founder</p>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className={`video-card ${activeIndex === 2 ? 'active' : ''}`} onClick={() => setActiveIndex(2)}>
            <div className="video-thumb">
              <img src="/assets/founder1.jpg" alt="Founder 3" />
              <div className="overlay"></div>
              <div className="play-btn"><div className="play-icon">▶</div></div>
              <div className="video-info">
                <h3>Alex Smith <span className="verified">✔</span></h3>
                <p>Product Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination-dots">
          <span className={`dot ${activeIndex === 0 ? 'active' : ''}`} onClick={() => setActiveIndex(0)}></span>
          <span className={`dot ${activeIndex === 1 ? 'active' : ''}`} onClick={() => setActiveIndex(1)}></span>
          <span className={`dot ${activeIndex === 2 ? 'active' : ''}`} onClick={() => setActiveIndex(2)}></span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="testi-right">
        <div className="testi-grid-wrapper">
          <div className="fog top"></div>
          <div className="fog bottom"></div>

          <div className="testi-grid">
            {/* Left Column */}
            <div className="column scroll-down">
              <div className="scroll-track">
                <div className="scroll-content">
                  {[1, 2, 3, 1, 2, 3].map((num, idx) => (
                    <div className="review-card" key={idx}>
                      <div className="review-header">
                        <img src={`/assets/founder${num}.jpg`} alt={`Founder ${num}`} className="avatar" />
                        <div>
                          <h4>Sarah Johnson <span className="verified">✔</span></h4>
                          <p>Software Developer</p>
                        </div>
                      </div>
                      <p className="review-text">
                        “LaunchPad Labs turned our idea into a working MVP in record time. Couldn’t have asked for a smoother process.”
                      </p>
                      <div className="stars">★★★★★</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="column scroll-up">
              <div className="scroll-track">
                <div className="scroll-content">
                  {[3, 1, 2, 3, 1, 2].map((num, idx) => (
                    <div className="review-card" key={idx}>
                      <div className="review-header">
                        <img src={`/assets/founder${num}.jpg`} alt={`Founder ${num}`} className="avatar" />
                        <div>
                          <h4>Alex Smith <span className="verified">✔</span></h4>
                          <p>Product Manager</p>
                        </div>
                      </div>
                      <p className="review-text">
                        “We saved months of development time and managed to raise our seed round faster thanks to this MVP.”
                      </p>
                      <div className="stars">★★★★★</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
