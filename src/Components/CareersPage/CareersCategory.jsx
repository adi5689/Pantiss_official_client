/* eslint-disable react/prop-types */
import { memo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useContent } from "../../features/content/useContent";
import { isOpen } from "../../features/content/model";
import Heading from "../Common/Heading";
const areaDesigns = [{
  title: "BD & Partnership",
  img: "/assets/careers/optimized/business-development.jpg"
}, {
  title: "Project Management",
  img: "/assets/careers/optimized/project-management.jpg"
}, {
  title: "HR & Admin",
  img: "/assets/careers/optimized/hr.jpg"
}, {
  title: "ICT Development",
  img: "/assets/careers/optimized/ict.jpg"
}, {
  title: "Branding & Communication",
  img: "/assets/careers/optimized/branding-communication.jpg"
}, {
  title: "Civil Engineering",
  img: "/assets/careers/optimized/civil-engineering.jpg"
}, {
  title: "Research & Advocacy",
  img: "/assets/careers/optimized/research-advocacy.jpg"
}];

// Memoized CareerCard component
const CareerCard = memo(({
  area,
  onClick
}) => <div className="w-[82vw] max-w-72 shrink-0 snap-start sm:w-64 lg:w-[calc(25%_-_1.125rem)] lg:max-w-none">
    <button type="button" onClick={() => onClick(area.title)} className="group block w-full cursor-pointer rounded-2xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600" aria-label={`View ${area.count} open ${area.title} jobs`}>
      <div className="relative w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 mx-auto overflow-hidden">
        <img src={area.img} alt={area.title} className="w-full h-full rounded-full object-cover shadow-xl ring-1 ring-white/30 transition duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
        <span className="absolute top-2 sm:top-4 right-1 sm:right-2 bg-white ring-2 ring-red-600 text-red-600 min-w-10 h-10 px-2 flex items-center justify-center text-sm font-bold rounded-full shadow-lg">
          {area.count}
        </span>
      </div>
      <h3 className="mt-3 sm:mt-4 text-base sm:text-lg text-white font-semibold text-center transition group-hover:text-red-100">
        {area.title}
      </h3>
      <p className="mt-1 text-center text-xs text-red-100">
        {area.count === 1 ? "1 open position" : `${area.count} open positions`}
      </p>
    </button>
  </div>);
CareerCard.displayName = "CareerCard";
const CareersCategory = () => {
  const {
    records,
    loading,
    error
  } = useContent('jobs');
  const openJobs = records.filter(job => isOpen(job));
  const careerAreas = [...new Set([...areaDesigns.map(a => a.title), ...openJobs.map(j => j.category)])].map(title => ({
    title,
    img: areaDesigns.find(a => a.title === title)?.img || areaDesigns[0].img,
    count: loading || error ? '—' : openJobs.filter(j => j.category === title).length
  }));
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const handleCardClick = category => {
    navigate(`/careers/jobs?category=${encodeURIComponent(category)}`);
  };
  const scrollCareerAreas = direction => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: "smooth"
    });
  };
  return <section className="bg-red-600 px-4 sm:px-8 py-12 flex flex-col">
      <div className="mx-auto lg:max-w-7xl max-w-3xl w-full">
        <Heading text="WHAT CAREER AREA INTERESTS YOU?" color="text-white" bgColor="bg-white" />
        <p className="mt-4 text-gray-100 text-sm sm:text-base text-center sm:text-left">
          Discover how you can be a part of that change by choosing a career path
          that interests you the most.
        </p>

        <div className="relative mt-8">
          <button type="button" onClick={() => scrollCareerAreas(-1)} aria-label="Previous career areas" className="absolute left-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-red-600 shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 sm:-left-3">
            <FaChevronLeft aria-hidden="true" />
          </button>

          <div ref={carouselRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-12 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {careerAreas.map(area => <CareerCard key={area.title} area={area} onClick={handleCardClick} />)}
          </div>

          <button type="button" onClick={() => scrollCareerAreas(1)} aria-label="Next career areas" className="absolute right-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-red-600 shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 sm:-right-3">
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/careers/jobs" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 font-semibold text-red-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600">
            View All Jobs
          </Link>
        </div>
      </div>
    </section>;
};
export default memo(CareersCategory);
