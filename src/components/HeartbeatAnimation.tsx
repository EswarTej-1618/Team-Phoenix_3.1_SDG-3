import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const HeartbeatAnimation = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-heart/10"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-heart/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.2, 0.8],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1,
        }}
      />
      
      {/* Heart icon */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.15, 1, 1.1, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.15, 0.3, 0.45, 1],
        }}
      >
        <motion.div
          className="shadow-glow-heart rounded-full p-4"
          animate={{
            boxShadow: [
              "0 0 30px hsl(350 85% 60% / 0.3)",
              "0 0 60px hsl(350 85% 60% / 0.6)",
              "0 0 30px hsl(350 85% 60% / 0.3)",
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart 
            className="w-16 h-16 text-heart fill-heart" 
            strokeWidth={1.5}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeartbeatAnimation;
