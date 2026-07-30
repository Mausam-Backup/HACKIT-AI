import Link from "next/link";

export default function Mission() {
  return (
    <section className="mission" id="company" aria-labelledby="mission-title" data-section="mission">
      <div className="mission__inner">
        <p className="mission__eyebrow">From Problem to Pitch</p>

        <div className="mission__statement">
          <h2 id="mission-title">
            Every great hackathon project starts with a clear problem — and ends with a pitch that lands.
            HAC-KIT AI connects both with intelligent multi-agent orchestration.
          </h2>

          <Link className="mission__button" href="#technology">
            <span className="mission__button-icon" aria-hidden="true">
              <i className="ph ph-arrow-elbow-down-right"></i>
            </span>
            <span>Explore the Platform</span>
          </Link>
        </div>

        <p className="mission__support">
          From parsing problem statements to generating boilerplate, our AI agents keep your team aligned,
          focused, and shipping — so you can build what matters.
        </p>

        <div className="mission__media" aria-label="HAC-KIT AI platform preview"></div>
      </div>
    </section>
  );
}
