import { useRef } from "react";

const FeaturedPublicationBanner = () => {
  const bannerRef = useRef(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (bannerRef.current) {
//         const scrollPosition = window.scrollY;
//         // Adjust the parallax effect to move subtly with scroll, not against it
//         const parallaxOffset = scrollPosition * -0.2; // Negative for downward movement
//         bannerRef.current.style.backgroundPositionY = `calc(50% + ${parallaxOffset}px)`;
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

  return (
    <div
      ref={bannerRef}
      className="relative bg-cover bg-center h-[320px] flex items-center justify-center text-white overflow-hidden shadow-lg"
      style={{
        backgroundImage: `url(/assets/publications/mining_villages_summit.jpg)`,
        backgroundAttachment: "fixed", // Fixed background
        backgroundRepeat: "no-repeat", // Prevent repetition
        backgroundSize: "cover", // Ensure full coverage
        backgroundPosition: "center", // Initial centering
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row max-w-7xl items-center justify-between w-full p-6">
        <div className="md:w-2/3">
          <h2 className="text-2xl md:text-6xl font-semibold mb-2">
            2025 Model Mining Villages Report
          </h2>
          <p className="text-md md:text-lg text-gray-200 mb-4">
            Dive into our latest findings on innovative farming solutions for a greener future.
          </p>
        </div>
        <button className="px-6 py-2 bg-red-600 rounded-md text-white font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 md:ml-4">
          Coming Soon
        </button>
      </div>
    </div>
  );
};

export default FeaturedPublicationBanner;