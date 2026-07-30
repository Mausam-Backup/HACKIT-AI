import Link from "next/link";

export default function Mission() {
  return (
    <section className="mission" id="company" aria-labelledby="mission-title" data-section="mission">
      <div className="mission__inner">
        <p className="mission__eyebrow">All-In-One Hackathon Execution Engine</p>

        <div className="mission__statement">
          <h2 id="mission-title">
            Every great hackathon project starts with a clear problem statement and ends with a winning pitch. HAC-KIT AI powers both with Model Context Protocol (FastMCP) and Mem0 vector memory.
          </h2>

          <Link className="mission__button" href="#our-edge">
            <span className="mission__button-icon" aria-hidden="true">
              <i className="ph ph-arrow-elbow-down-right"></i>
            </span>
            <span>Explore Platform</span>
          </Link>
        </div>

        <p className="mission__support">
          From problem statement parsing to real-time AI interview practice and automated presentation exporting (PPTX/PDF), our platform keeps your team focused, aligned, and shipping.
        </p>

        <div className="mission__media" aria-label="HAC-KIT AI platform preview"></div>
      </div>
    </section>
  );
}
