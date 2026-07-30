"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ServiceSummary = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=800 center",
        scrub: true,
        pin: true,
        pinSpacing: true,
      },
    });

    tl.to("#title-service-1", { xPercent: 15 }, 0);
    tl.to("#title-service-2", { xPercent: -20 }, 0);
    tl.to("#title-service-3", { xPercent: 12 }, 0);
    tl.to("#title-service-4", { xPercent: -15 }, 0);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="bg-[#EAEAEA] min-h-screen w-full overflow-hidden font-normal text-black text-center flex flex-col items-center justify-center"
    >
      <div className="w-full flex flex-col items-center gap-6 md:gap-10 text-4xl md:text-6xl lg:text-[4.5rem] leading-none whitespace-nowrap">
        <div id="title-service-1">
          <p>Architecture</p>
        </div>
        <div
          id="title-service-2"
          className="flex items-center justify-center gap-3 md:gap-6"
        >
          <p>Development</p>
          <div className="w-10 h-[2px] md:w-20 md:h-[3px] bg-[#C6A052]" />
          <p>Deployment</p>
        </div>
        <div
          id="title-service-3"
          className="flex items-center justify-center gap-3 md:gap-6"
        >
          <p>APIs</p>
          <div className="w-10 h-[2px] md:w-20 md:h-[3px] bg-[#C6A052]" />
          <p className="italic font-light">Frontends</p>
          <div className="w-10 h-[2px] md:w-20 md:h-[3px] bg-[#C6A052]" />
          <p>Scalability</p>
        </div>
        <div id="title-service-4">
          <p>Databases</p>
        </div>
      </div>
    </section>
  );
};

export default ServiceSummary;
