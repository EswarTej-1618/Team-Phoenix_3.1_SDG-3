import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const MotherBabyHeartAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-72 h-72 rounded-full border-2 border-primary/20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-primary/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Main circular container with gradient */}
      <motion.div
        className="relative w-56 h-56 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, hsl(205 100% 55% / 0.2) 0%, hsl(220 25% 18%) 100%)",
          boxShadow: "0 0 60px hsl(205 100% 55% / 0.3), inset 0 0 40px hsl(205 100% 55% / 0.1)",
        }}
        animate={{
          boxShadow: [
            "0 0 60px hsl(205 100% 55% / 0.3), inset 0 0 40px hsl(205 100% 55% / 0.1)",
            "0 0 80px hsl(205 100% 55% / 0.5), inset 0 0 60px hsl(205 100% 55% / 0.2)",
            "0 0 60px hsl(205 100% 55% / 0.3), inset 0 0 40px hsl(205 100% 55% / 0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Mother silhouette - outer circle */}
        <motion.div
          className="relative w-44 h-44 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, hsl(205 80% 50% / 0.3) 0%, hsl(220 30% 15%) 100%)",
            border: "2px solid hsl(205 100% 55% / 0.4)",
          }}
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Baby silhouette - inner circle */}
          <motion.div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, hsl(205 100% 55% / 0.2) 0%, hsl(220 30% 12%) 100%)",
              border: "2px solid hsl(175 70% 45% / 0.5)",
              boxShadow: "inset 0 0 20px hsl(175 70% 45% / 0.2)",
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          >
            {/* Heart icon in the center */}
            <motion.div
              className="relative z-10"
              animate={{
                scale: [1, 1.2, 1, 1.15, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.3, 0.45, 1],
              }}
            >
              <motion.div
                className="rounded-full p-3"
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(350 85% 60% / 0.4)",
                    "0 0 40px hsl(350 85% 60% / 0.7)",
                    "0 0 20px hsl(350 85% 60% / 0.4)",
                  ],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart 
                  className="w-10 h-10 text-heart fill-heart" 
                  strokeWidth={1.5}
                />
              </motion.div>
            </motion.div>

            {/* Heart pulse rings */}
            <motion.div
              className="absolute w-16 h-16 rounded-full border-2 border-heart/40"
              animate={{
                scale: [1, 1.8],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border border-heart/30"
              animate={{
                scale: [1, 2],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.2,
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/40"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default MotherBabyHeartAnimation;
