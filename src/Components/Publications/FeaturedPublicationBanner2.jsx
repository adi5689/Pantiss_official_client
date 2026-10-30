/* eslint-disable react/prop-types */
import { useRef } from "react";

const FeaturedPublicationBanner2 = ({ onOpen }) => {
  const bannerRef = useRef(null);

  return (
    <div
      ref={bannerRef}
      className="relative bg-cover bg-center h-[320px] flex justify-center items-center text-white overflow-hidden shadow-lg"
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1wYWN0JTIwYXNzZXNzbWVudHxlbnwwfHwwfHx8Mg%3D%3D)`, // Updated to an impact assessment-themed image
        backgroundAttachment: "fixed", // Fixed background for parallax effect
        backgroundRepeat: "no-repeat", // No repetition
        backgroundSize: "cover", // Full coverage
        backgroundPosition: "center", // Initial centering
        backgroundColor: "#1a202c", // Fallback color (gray-900)
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center max-w-7xl justify-between w-full p-6">
        <div className="md:w-2/3">
          <h2 className="text-2xl md:text-6xl font-semibold mb-2">
            Our Programs Impact Assessment Report
          </h2>
          <p className="text-md md:text-lg text-gray-200 mb-4">
            Evaluating our initiatives’ transformative effects on communities
            and environments.
          </p>
        </div>
        <button onClick={onOpen} className="px-6 py-2 bg-red-600 rounded-md text-white font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 md:ml-4">
          View Report
        </button>
      </div>
    </div>
  );
};

export default FeaturedPublicationBanner2;
