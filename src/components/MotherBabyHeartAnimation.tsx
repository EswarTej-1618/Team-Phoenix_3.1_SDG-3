/**
 * SafeMOM: mother and baby image in an oval with radiating ring animation.
 */
import { motion } from "framer-motion";

const RING_COUNT = 5;
const OVAL_WIDTH = 280;
const OVAL_HEIGHT = 350;

const MotherBabyHeartAnimation = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Animated concentric oval rings */}
      {[...Array(RING_COUNT)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[50%] border-2 border-primary/40"
          style={{
            width: OVAL_WIDTH + (i + 1) * 32,
            height: OVAL_HEIGHT + (i + 1) * 40,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Inner glow ring */}
      <motion.div
        className="absolute rounded-[50%] border-2 border-primary/60 shadow-[0_0_30px_hsl(205_100%_55%_/_0.25)]"
        style={{
          width: OVAL_WIDTH + 16,
          height: OVAL_HEIGHT + 20,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          boxShadow: [
            "0 0 30px hsl(205 100% 55% / 0.2)",
            "0 0 50px hsl(205 100% 55% / 0.4)",
            "0 0 30px hsl(205 100% 55% / 0.2)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Floating dots around the oval */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const rx = OVAL_WIDTH / 2 + 80;
        const ry = OVAL_HEIGHT / 2 + 100;
        return (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${Math.cos(angle) * rx}px)`,
              top: `calc(50% + ${Math.sin(angle) * ry}px)`,
            }}
            animate={{
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 2 + (i % 3) * 0.5,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        );
      })}

      {/* Oval frame + image */}
      <div
        className="relative overflow-hidden rounded-[50%] bg-white/5 shadow-lg"
        style={{
          width: OVAL_WIDTH,
          height: OVAL_HEIGHT,
        }}
      >
        <img
          src="/mother-baby-heart.png"
          alt="Mother holding baby with heartbeat"
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
};

export default MotherBabyHeartAnimation;
