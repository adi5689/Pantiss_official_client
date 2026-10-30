
const Hero = () => {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-black">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/publications/publication_hero.mp4" type="video/mp4" />
      </video>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />

      {/* Soft Glow Accent */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-600/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/20 blur-[120px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">

        <div className="max-w-7xl mx-auto px-6 w-full">

          <div className="max-w-2xl text-white">

            {/* Label */}
            <div className="mb-6">
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm tracking-wide border border-white/20">
                Publications & Research
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Insights for a
              <span className="block bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                Changing World
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
              Discover Pantiss publications exploring workforce transformation,
              sustainability, and community development. Our research delivers
              practical insights for policymakers, industry leaders, and
              innovators.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">

              <a href="#impact-library"
                className="
                  px-7 py-3
                  bg-red-600
                  text-white
                  font-semibold
                  rounded-lg
                  shadow-lg
                  hover:bg-red-700
                  transition
                "
              >
                Browse Publications
              </a>
              <a href="#impact-reports" className="px-7 py-3 rounded-lg border border-white/30 backdrop-blur-md text-white hover:bg-white/10 transition">
                Latest Report →
              </a>



            </div>

          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;