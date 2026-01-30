/**
 * SafeMOM: mother and baby image in a circle with radiating ring animation.
 */
import { motion } from "framer-motion";

const RING_COUNT = 5;
const SIZE = 350;

const MotherBabyHeartAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-[350px] h-[350px] shrink-0">
      {/* Animated concentric circular rings */}
      {[...Array(RING_COUNT)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-primary/40"
          style={{
            width: SIZE + (i + 1) * 36,
            height: SIZE + (i + 1) * 36,
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
        className="absolute rounded-full border-2 border-primary/60 shadow-[0_0_30px_hsl(205_100%_55%_/_0.25)]"
        style={{
          width: SIZE + 16,
          height: SIZE + 16,
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

      {/* Floating dots around the circle */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = SIZE / 2 + 90;
        return (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px)`,
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

      {/* Circular frame + image */}
      <div
        className="relative overflow-hidden rounded-full bg-white/5 shadow-lg aspect-square w-[350px] h-[350px]"
        style={{ width: SIZE, height: SIZE }}
      >
        <img
          src="/mother-baby-heart.png"
          alt="Mother holding baby with heartbeat"
          className="h-full w-full object-cover object-center rounded-full"
        />
      </div>
    </div>
  );
};

export default MotherBabyHeartAnimation;
