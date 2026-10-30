import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer2 = () => {
  // ✅ What We Do list with links
  const whatWeDo = [
    {
      title: "Planning, Policy & Governance (PPG)",
      link: "https://x-social-force.vercel.app/",
      external: true,
    },
    {
      title: "TVET (Technical, Vocational, Educational Training)",
      link: "https://pantiss-skill-universe.vercel.app/",
      external: true,
    },
    {
      title: "Livelihood & Entrepreneurship",
      link: "https://carp-duck-rice.vercel.app/",
      external: true,
    },
    {
      title: "Health & Nutrition",
      link: "https://nutri-nova-mu.vercel.app/",
      external: true,
    },
    {
      title: "Water & Sanitation",
      link: "https://admin-mowash.vercel.app/",
      external: true,
    },
    {
      title: "Environment & Ecology",
      link: "/what-we-do/land-acquisition-rehabilitation-&-resettlement-of-mines",
    },
  ];

  return (
    <footer className="relative bg-black text-white pb-8">
      {/* Header Image */}
      <img
        src="/assets/footer/footer_img.png"
        alt="Pantiss Footer Banner"
        className="w-full"
      />

      <div className="container mx-auto px-4">
        {/* What We Do Section */}
        <div className="border-t border-white mt-8 pt-4 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold mb-4 text-center text-red-600">
            What We Do
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-center">
            {whatWeDo.map((item) =>
              item.external ? (
                <a
                  key={item.title}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-red-600 transition-colors duration-300"
                >
                  {item.title}
                </a>
              ) : (
                <Link
                  key={item.title}
                  to={item.link}
                  className="hover:underline hover:text-red-600 transition-colors duration-300"
                >
                  {item.title}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-red-600 mt-6 pt-6 gap-8 text-center md:text-left">
          {/* Contact Us Section */}
          <div className="flex flex-col lg:justify-start lg:items-start justify-center items-center">
            <h3 className="text-lg font-bold mb-4 text-red-600">Contact Us</h3>

            <img
              src="/assets/pantiss_logo.png"
              alt="Pantiss Logo"
              className="w-44 mx-auto md:mx-0 mb-4"
            />

            <p className="max-w-lg text-center lg:text-left leading-relaxed">
              Plot No 1215/1500, Khandagiri Bari, Bank of India Lane,
              Bhubaneswar, Odisha, 751030
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-x-3 mt-3">
              <FaEnvelope className="text-[18px]" />
              <a
                href="mailto:info@pantiss.org"
                className="underline hover:text-red-600"
              >
                info@pantiss.org
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-x-3 mt-2">
              <FaPhoneAlt className="text-[18px]" />
              <a href="tel:06743588734" className="underline hover:text-red-600">
                0674-3588734
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col justify-center items-center md:items-start space-y-2">
            <h3 className="text-lg font-bold mb-4 text-red-600">Quick Links</h3>
            <Link to="/" className="hover:underline hover:text-red-600">
              Home
            </Link>
            <Link
              to="/whoweare/about"
              className="hover:underline hover:text-red-600"
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className="hover:underline hover:text-red-600"
            >
              Contact Us
            </Link>
            <Link to="/careers" className="hover:underline hover:text-red-600">
              Careers
            </Link>
            <Link
              to="/admin/login"
              className="rounded-sm hover:underline hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Admin Login
            </Link>
          </div>

          {/* Social Media Section */}
          <div className="mt-5 flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold mb-4 text-red-600">
              Join the Conversation
            </h3>
            <div className="flex space-x-4 justify-center">
              <a
                href="https://facebook.com/pantissfoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[18px] bg-red-600 hover:bg-white hover:text-red-600 rounded-full p-3 transition-all duration-300"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com/pantiss_org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[18px] bg-red-600 hover:bg-white hover:text-red-600 rounded-full p-3 transition-all duration-300"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com/pantissfoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[18px] bg-red-600 hover:bg-white hover:text-red-600 rounded-full p-3 transition-all duration-300"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com/company/pantissfoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[18px] bg-red-600 hover:bg-white hover:text-red-600 rounded-full p-3 transition-all duration-300"
              >
                <FaLinkedin />
              </a>
            </div>

            <button className="bg-red-600 hover:bg-white hover:text-red-600 text-white font-semibold px-6 py-2 mt-4 rounded-md transition-all duration-300">
              Downloads
            </button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white mt-8 pt-4">
          <div className="flex flex-col md:flex-row justify-between text-sm text-center md:text-left">
            <div>© 2024 PANTISS Foundation | PANTISS Communication</div>
            <div className="flex justify-center space-x-4 mt-2 md:mt-0">
              Developed by - <span className="text-red-600">Aditya Sahu</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
