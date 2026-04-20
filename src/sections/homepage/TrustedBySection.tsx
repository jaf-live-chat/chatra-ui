import { motion } from "motion/react";

const TrustedBySection = () => {
  const logosContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  };

  const logoItem = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px) grayscale(100%)" },
    visible: {
      opacity: 0.58,
      y: 0,
      filter: "blur(0px) grayscale(100%)",
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center border-b-0">
        <motion.p
          className="text-[#9ca3af] mb-10"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          TRUSTED BY GROWING BUSINESSES WORLDWIDE
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center items-center gap-10 lg:gap-14"
          variants={logosContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Faked logos to match layout */}
          <motion.div
            className="flex items-center gap-1.5 text-[#64748b] font-bold text-xl tracking-tight cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#4285F4", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(66, 133, 244, 0.45))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/></svg>
            <span className="font-medium">Google</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[#64748b] font-bold text-xl tracking-tighter cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#1DB954", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(29, 185, 84, 0.45))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M16.586,16.424 c-0.18,0.295-0.563,0.387-0.857,0.207c-2.348-1.435-5.295-1.76-8.775-0.963c-0.34,0.077-0.669-0.134-0.748-0.474 c-0.077-0.34,0.134-0.669,0.474-0.748c3.812-0.871,7.066-0.496,9.697,1.117C16.671,15.742,16.765,16.129,16.586,16.424z M17.809,13.693c-0.226,0.366-0.706,0.485-1.072,0.259c-2.7-1.656-6.817-2.136-9.965-1.166c-0.428,0.132-0.884-0.108-1.016-0.536 c-0.132-0.428,0.108-0.884,0.536-1.016c3.606-1.112,8.156-0.573,11.258,1.385C17.915,12.845,18.035,13.326,17.809,13.693z M17.914,10.8c-3.23-1.916-8.561-2.095-11.642-1.157c-0.514,0.155-1.056-0.134-1.21-0.648c-0.155-0.514,0.134-1.056,0.648-1.21 c3.518-1.071,9.408-0.865,13.111,1.332c0.463,0.275,0.617,0.874,0.342,1.337C18.887,10.916,18.288,11.07,17.914,10.8z"/></svg>
            <span>Spotify</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[#64748b] font-bold text-xl tracking-tight cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#611f69", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(97, 31, 105, 0.5))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.12a2.528 2.528 0 0 1 2.521 2.522v2.523H5.042zM5.503 10.12a2.528 2.528 0 0 1 2.521-2.523 2.528 2.528 0 0 1 2.521 2.523v6.306A2.528 2.528 0 0 1 8.024 18.95a2.528 2.528 0 0 1-2.521-2.524V10.12zM15.165 18.95a2.528 2.528 0 0 1-2.523 2.52A2.528 2.528 0 0 1 10.12 18.95a2.528 2.528 0 0 1 2.522-2.521h2.523V18.95zM10.12 18.489a2.528 2.528 0 0 1-2.523-2.521 2.528 2.528 0 0 1 2.523-2.521h6.306A2.528 2.528 0 0 1 18.95 15.968a2.528 2.528 0 0 1-2.524 2.521H10.12zM18.95 8.835a2.528 2.528 0 0 1 2.52 2.523A2.528 2.528 0 0 1 18.95 13.88a2.528 2.528 0 0 1-2.521-2.522V8.835H18.95zM18.489 13.88a2.528 2.528 0 0 1-2.521 2.523A2.528 2.528 0 0 1 13.447 13.88v-6.306A2.528 2.528 0 0 1 15.968 5.05a2.528 2.528 0 0 1 2.521 2.524V13.88zM8.835 5.05a2.528 2.528 0 0 1 2.523-2.52A2.528 2.528 0 0 1 13.88 5.05a2.528 2.528 0 0 1-2.522 2.521H8.835V5.05zM13.88 5.511a2.528 2.528 0 0 1 2.523 2.521 2.528 2.528 0 0 1-2.523 2.521H7.574A2.528 2.528 0 0 1 5.05 8.032a2.528 2.528 0 0 1 2.524-2.521H13.88z"/></svg>
            <span>slack</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[#64748b] font-bold text-2xl tracking-tighter uppercase relative top-[1px] cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#E50914", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(229, 9, 20, 0.5))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <span>NETFLIX</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[#64748b] font-semibold text-xl tracking-tighter lowercase cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#FF5A5F", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(255, 90, 95, 0.45))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2c-2.316,0-5.836,3.693-7.551,6.582c-1.597,2.69-2.368,5.438-2.368,7.917C2.081,20.088,4.921,22,8.04,22 c1.97,0,3.676-0.655,5.135-2.034C14.62,21.365,16.486,22,18.423,22c2.146,0,4.298-1.1,5.228-3.037 c0.334-0.697,0.457-1.583,0.457-2.399C24.108,12.721,20.021,2,12,2z M18.423,19.98c-1.789,0-3.663-1.077-4.475-2.825 C13.435,16.036,13,14.654,13,13.1c0-2.483,0.852-5.267,2.238-7.79c1.696-3.093,4.957-6.498,6.671-6.498c0.041,0.024,0.061,0.054,0.072,0.068 C22.846,0.612,24,10.608,24,16.564c0,0.635-0.1,1.353-0.354,1.884C22.779,19.066,20.73,19.98,18.423,19.98z M8.04,19.98 c-2.052,0-4.004-1.127-4.004-3.481c0-2.033,0.637-4.24,1.968-6.52c1.472-2.523,4.526-5.83,6.381-5.83c0.046,0,0.085,0.016,0.119,0.024 C12.284,8.513,11,10.59,11,13.1c0,1.554-0.435,2.936-0.948,4.055C9.24,18.903,7.366,19.98,8.04,19.98z"/></svg>
            <span className="font-bold">airbnb</span>
          </motion.div>
          <motion.div
            className="flex items-center text-[#64748b] cursor-default"
            variants={logoItem}
            whileHover={{ opacity: 1, y: -2, scale: 1.04, color: "#00A4EF", filter: "grayscale(0%) drop-shadow(0 0 12px rgba(0, 164, 239, 0.45))" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 2.4L2.3 4c-.3.1-.5.3-.5.6v6.9h9.6V2.4zm10.3-1.4l-9.3 1.3v9.2h9.8V1.5c0-.3-.3-.5-.5-.5zm-10.3 11.5H1.8v7c0 .3.2.5.5.5l9.1 1.3v-8.8zm1.2 8.8l9.3-1.3c.3 0 .5-.3.5-.6v-6.9h-9.8v8.8z"/></svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TrustedBySection;


