/* eslint-disable react/prop-types */
import { useState } from "react";
import Heading from "../Common/Heading";

const VideoSectionWithPopup = ({ videos = [], onOpen, onBrowse }) => {
  const [activeVideo, setActiveVideo] = useState(null);



  if (!videos.length) return null;
  return (
    <section className="bg-red-600 py-10 px-6">
      <div className="container mx-auto">
        <Heading text="VIDEOS" color="text-white" bgColor="bg-white" />

        {/* Video Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => video.youtubeId ? setActiveVideo(video.youtubeId) : onOpen(video)}
              className="group bg-white rounded-xl shadow-lg overflow-hidden text-left
                         hover:shadow-2xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black">
                <img
                  src={video.imageUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/60
                                  flex items-center justify-center
                                  group-hover:scale-110 transition">
                    <svg
                      className="w-9 h-9 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="p-6 h-[100px]">
                <h3 className="text-lg font-semibold text-red-600 leading-snug">
                  {video.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* View More */}
        <div className="flex justify-center items-center mt-10">
          <button onClick={onBrowse}
            className="
              px-6 py-3
              bg-white
              rounded-lg
              text-red-600 font-medium
              hover:bg-black hover:text-white
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-white
            "
          >
            View More
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white text-3xl
                         hover:text-red-400 transition"
              aria-label="Close video"
            >
              ✕
            </button>

            {/* YouTube iframe */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoSectionWithPopup;
