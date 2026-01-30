/**
 * SafeMOM: mother and baby image with heartbeat symbol.
 */
const MotherBabyHeartAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-[min(100%,28rem)] h-[min(100%,28rem)] min-w-[320px] min-h-[320px] max-w-[480px] max-h-[480px]">
      <img
        src="/mother-baby-heart.png"
        alt="Mother holding baby with heartbeat"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MotherBabyHeartAnimation;
