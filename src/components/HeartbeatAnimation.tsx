import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const HeartbeatAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-28 h-16">
      {/* Outer glow rings (oval / compact) */}
      <motion.div
        className="absolute w-28 h-16 rounded-full bg-heart/10"
        animate={{
          scale: [1, 1.7, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-20 h-10 rounded-full bg-heart/20"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.8, 0.2, 0.8],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.08,
        }}
      />

      {/* Heart icon (smaller) */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.12, 1, 1.08, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.15, 0.3, 0.45, 1],
        }}
      >
        <motion.div
          className="shadow-glow-heart rounded-full p-1"
          animate={{
            boxShadow: [
              "0 0 14px hsl(350 85% 60% / 0.25)",
              "0 0 28px hsl(350 85% 60% / 0.45)",
              "0 0 14px hsl(350 85% 60% / 0.25)",
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="w-6 h-6 text-heart fill-heart"
            strokeWidth={1.2}
            aria-hidden
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeartbeatAnimation;
