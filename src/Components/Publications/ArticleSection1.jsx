/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, memo } from "react";
import Heading from "../Common/Heading";
import { motion, AnimatePresence } from "framer-motion";



// Memoized list card
const SideCard = memo(({ article, onClick }) => (
  <motion.button type="button"
    onClick={onClick}
    whileHover={{ y: -4, scale: 1.02 }}
    className="
      text-left flex gap-4
      rounded-xl
      overflow-hidden
      cursor-pointer
      bg-white/95
      shadow-md
      transition
      will-change-transform
    "
  >
    <div className="w-[160px] h-[110px] overflow-hidden">
      <img
        src={article.imageUrl}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    </div>

    <div className="p-4 flex flex-col justify-center">
      <span className="text-xs text-red-600 font-semibold uppercase tracking-wide">
        Insight • {article.date}
      </span>

      <h3 className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
        {article.title}
      </h3>
    </div>
  </motion.button>
));

SideCard.displayName = "ImpactInsightCard";

const ArticleSection1 = ({ articles = [], onOpen }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto rotate (pause when tab hidden)
  useEffect(() => {
    if (articles.length < 2) return;
    const interval = setInterval(() => {
      if (!document.hidden) {
        setActiveIndex((prev) => (prev + 1) % articles.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length]);

  const activeArticle = articles[activeIndex % articles.length];

  // Memo side articles
  const sideArticles = useMemo(
    () => articles.filter((_, i) => i !== activeIndex),
    [activeIndex, articles]
  );

  if (!articles.length) return null;
  return (
    <section className="bg-red-600 py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-12">
          <Heading text="NEWS" color="text-white" bgColor="bg-white" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* LEFT — ACTIVE ARTICLE */}
          <div className="lg:w-1/2 relative">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="
                  relative
                  rounded-2xl
                  overflow-hidden
                  shadow-xl
                  will-change-transform
                "
              >
                <img
                  src={activeArticle.imageUrl}
                  alt={activeArticle.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-[420px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">

                  <span className="text-xs uppercase tracking-wide text-white/70">
                    Featured Insight • {activeArticle.date}
                  </span>

                  <h2 className="text-2xl md:text-3xl font-bold mt-2 leading-snug">
                    {activeArticle.title}
                  </h2>

                  {activeArticle.description && (
                    <p className="text-white/80 mt-3 text-sm md:text-base">
                      {activeArticle.description}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />

              </motion.div>
            </AnimatePresence>

          </div>

          {/* RIGHT — LIST */}
          <div className="lg:w-1/2 flex flex-col gap-5">

            {sideArticles.map((article, index) => (
              <SideCard
                key={index}
                article={article}
                onClick={() =>
                  setActiveIndex(articles.indexOf(article))
                }
              />
            ))}

          </div>

        </div>

        {/* View More */}
        <div className="flex justify-center items-center mt-10">
          <button onClick={() => onOpen(activeArticle)}
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
    </section>
  );
};

export default ArticleSection1;