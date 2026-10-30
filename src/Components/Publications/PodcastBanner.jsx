import { useRef } from "react";

const PodcastBanner = () => {
  const bannerRef = useRef(null);

  return (
    <div
      ref={bannerRef}
      className="relative bg-cover bg-center h-[320px] flex justify-center items-center text-white overflow-hidden shadow-lg"
      style={{
        backgroundImage: `url(/assets/publications/podcasts.jpg)`,
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1a202c",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-65"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between max-w-7xl w-full p-6">
        {/* Text */}
        <div className="md:w-2/3">
          <h2 className="text-2xl md:text-6xl font-semibold mb-2">
            Voices of Impact — The Podcasts
          </h2>
          <p className="text-md md:text-lg text-gray-200 mb-4 max-w-2xl">
            Conversations with industry leaders, educators, and change-makers
            shaping the future of skills, sustainability, and livelihoods.
          </p>
        </div>

        {/* CTA */}
        {/* <button
          className="px-6 py-2 bg-red-600 rounded-md text-white font-medium
                     hover:bg-red-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-red-500 md:ml-4"
        >
          Listen Now
        </button> */}
      </div>
    </div>
  );
};

export default PodcastBanner;
