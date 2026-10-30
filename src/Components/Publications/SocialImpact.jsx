/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, memo } from "react";
import Heading from "../Common/Heading";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";



// Memoized Slide (prevents re-renders)
const ReportCard = memo(({ report, onOpen }) => (
  <div className="group relative rounded-2xl overflow-hidden shadow-xl will-change-transform">

    <img
      src={report.cover}
      alt={report.title}
      loading="lazy"
      decoding="async"
      className="
        w-full
        h-[420px]
        object-cover
        transition-transform duration-700
        group-hover:scale-105
      "
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

    <div className="absolute bottom-6 left-6 right-6 z-10">
      <h3 className="text-white text-[15px] font-semibold leading-snug">
        {report.title}
      </h3>
    </div>

    {/* Hover */}
    <div className="
      absolute inset-0
      bg-black/50
      opacity-0
      group-hover:opacity-100
      transition
      flex items-center justify-center
    ">
      <button onClick={() => onOpen(report)} className="px-5 py-2 rounded-full bg-white text-red-600 font-semibold shadow hover:scale-105 transition">
        👁 View Report
      </button>
    </div>

  </div>
));

ReportCard.displayName = "ImpactReportCard";

const SocialImpact = ({ reports = [], onOpen, onBrowse }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mount only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  if (!reports.length) return null;
  return (
    <section
      ref={sectionRef}
      className="bg-red-600 py-8 px-6 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">

        {/* LEFT */}
        <div className="text-white lg:w-1/2 w-full">

          <Heading
            text="RESEARCH & REPORTS"
            color="text-white"
            bgColor="bg-white"
          />

          <p className="mt-6 text-white/90 leading-relaxed max-w-md">
            Explore Pantiss research publications covering workforce
            development, industrial transformation, climate resilience,
            and community impact.
          </p>

          <button onClick={onBrowse} className="mt-8 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold shadow hover:bg-black hover:text-white transition">
            View All Reports →
          </button>

        </div>

        {/* RIGHT */}
        <div className="relative lg:w-1/2 w-full">

          {isVisible && (
            <Swiper
              effect={"coverflow"}
              centeredSlides
              grabCursor
              slidesPerView={"auto"}
              loop={reports.length > 2}
              speed={700}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 220, // reduced for performance
                modifier: 2,
                slideShadows: false,
              }}
              pagination={{ el: ".custom-pagination", clickable: true }}
              navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev",
              }}
              modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            >
              {reports.map((report, index) => (
                <SwiperSlide key={index} style={{ width: "300px" }}>
                  <ReportCard report={report} onOpen={onOpen} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Navigation */}
          <div className="flex justify-center items-center gap-8 mt-8">

            <div className="custom-prev cursor-pointer">
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white text-white text-2xl hover:text-red-600 transition">
                ‹
              </div>
            </div>

            <div className="custom-pagination flex gap-2"></div>

            <div className="custom-next cursor-pointer">
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white text-white text-2xl hover:text-red-600 transition">
                ›
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Pagination Style */}
      <style>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 999px;
          transition: all 0.3s ease;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          width: 24px;
          background: white;
        }
      `}</style>
    </section>
  );
};

export default SocialImpact;