export default function Capabilities() {
  return (
    <section className="capabilities" id="solutions" aria-labelledby="capabilities-title">
      <div className="capabilities__header">
        <div className="capabilities__intro">
          <h2 id="capabilities-title">Hackathon teams need a platform that moves from idea to working demo — fast.</h2>
          <p>
            HAC-KIT AI combines multi-agent code generation, strategy automation, pitch coaching, and
            real-time collaboration for teams that cannot afford to waste a single hour.
          </p>
        </div>

        <a className="capabilities__button" href="#contact">
          <span>Start Building</span>
          <i className="ph ph-arrow-up-right" aria-hidden="true"></i>
        </a>
      </div>

      <div className="capabilities__grid" aria-label="HAC-KIT AI capabilities and proof points">
        <article className="cap-card cap-card--tall cap-card--media">
          <img className="cap-card__video" src="/hackathon-1.JPG" alt="Hackathon Milestones Background" />
          <div className="cap-card__shade" aria-hidden="true"></div>

          <div className="cap-card__label">
            <span>Hackathon Milestones</span>
          </div>

          <div className="cap-card__timeline">
            <div><span>2026</span><b aria-hidden="true"></b><strong>Global AI Hackathon Series</strong><em>Grand prize winner</em></div>
            <div><span>2025</span><b aria-hidden="true"></b><strong>University Circuit Launch</strong><em>12 university partnerships</em></div>
            <div><span>2024</span><b aria-hidden="true"></b><strong>Beta Release</strong><em>500+ early users</em></div>
          </div>
        </article>

        <div className="capabilities__stack">
          <article className="cap-card cap-card--quote">
            <div className="cap-card__label cap-card__label--left">
              <span>Winner&apos;s Voice</span>
            </div>
            <blockquote>
              &quot;HAC-KIT AI gave us the structure we didn&apos;t know we needed: clear task breakdowns, AI-generated
              boilerplate, and a pitch coach that turned our build log into a compelling narrative.&quot;
            </blockquote>
            <p><strong>Rhea Chen</strong> Captain, ACM Hackathon Champions</p>
          </article>

          <article className="cap-card cap-card--metric cap-card--video-panel">
            <img className="cap-card__video" src="/hackathon-3.JPG" alt="10K+ AI-Assisted Projects Background" />
            <div className="cap-card__shade" aria-hidden="true"></div>
            <div className="cap-card__metric">
              <strong>10K+</strong>
              <span>AI-Assisted Projects</span>
            </div>
          </article>
        </div>

        <div className="capabilities__stack capabilities__stack--systems">
          <article className="cap-card cap-card--tools cap-card--tools-media cap-card--video-panel">
            <img className="cap-card__video" src="/hacakthon-2.JPG" alt="Tech Stack Background" />
            <div className="cap-card__shade" aria-hidden="true"></div>

            <div className="cap-card__label">
              <span>Tech Stack</span>
            </div>

            <div className="tool-marquee" aria-hidden="true">
              <div className="tool-marquee__row tool-marquee__row--left">
                <span><i className="ph ph-gear-six"></i> Python</span>
                <span><i className="ph ph-fire"></i> React</span>
                <span><i className="ph ph-gauge"></i> TypeScript</span>
                <span><i className="ph ph-atom"></i> Node.js</span>
                <span><i className="ph ph-wrench"></i> Next.js</span>
                <span><i className="ph ph-gear-six"></i> Python</span>
                <span><i className="ph ph-fire"></i> React</span>
                <span><i className="ph ph-gauge"></i> TypeScript</span>
                <span><i className="ph ph-atom"></i> Node.js</span>
                <span><i className="ph ph-wrench"></i> Next.js</span>
              </div>
              <div className="tool-marquee__row tool-marquee__row--right">
                <span><i className="ph ph-cpu"></i> LangChain</span>
                <span><i className="ph ph-wave-sine"></i> FastAPI</span>
                <span><i className="ph ph-shield-check"></i> PostgreSQL</span>
                <span><i className="ph ph-rocket-launch"></i> Docker</span>
                <span><i className="ph ph-chart-line-up"></i> Vercel</span>
                <span><i className="ph ph-cpu"></i> LangChain</span>
                <span><i className="ph ph-wave-sine"></i> FastAPI</span>
                <span><i className="ph ph-shield-check"></i> PostgreSQL</span>
                <span><i className="ph ph-rocket-launch"></i> Docker</span>
                <span><i className="ph ph-chart-line-up"></i> Vercel</span>
              </div>
            </div>
          </article>

          <article className="cap-card cap-card--contact" id="contact">
            <div>
              <div className="cap-card__label cap-card__label--left">
                <span>Get Started</span>
              </div>
              <a href="mailto:hello@hackit.ai">hello@hackit.ai</a>
              <p>Early access — join the waitlist</p>
            </div>
            <a className="cap-card__icon-button" href="mailto:hello@hackit.ai" aria-label="Email HAC-KIT AI">
              <i className="ph ph-arrow-up-right" aria-hidden="true"></i>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
