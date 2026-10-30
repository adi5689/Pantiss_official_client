/* eslint-disable react/prop-types */
// CapacityDevelopment.js
import Heading from "../Common/Heading";



const CapacityDevelopment = ({ toolkitItems = [], onOpen, onBrowse }) => {
  if (!toolkitItems.length) return null;
  return (
    <section className="bg-white py-10 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Title */}
        <div className="text-center mb-12">
          <Heading text="TOOLKIT" color="text-black" bgColor="bg-red-500" />
        </div>

        {/* Toolkit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {toolkitItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:ring-2 ring-red-600 hover:shadow-2xl hover:-translate-y-2 h-[650px] flex flex-col"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-base line-clamp-5 mt-2">
                  {item.description}
                </p>
                {/* Spacer to push the footer to the bottom */}
                <div className="flex-grow" />
                {/* Footer with Date and Button */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-500 text-sm font-medium">
                    {item.date}
                  </span>
                  <a
                    href={item.exploreUrl || undefined}
                    onClick={e => { e.preventDefault(); onOpen(item); }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-full shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300"
                    aria-label={`Explore ${item.title}`}
                  >
                    Explore
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          <button onClick={onBrowse}
            className="
              px-6 py-3
              bg-red-600
              border border-white/30
              rounded-lg
              text-white font-medium
              hover:bg-white/20
              hover:text-red-600
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-red-600
            "
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CapacityDevelopment;
