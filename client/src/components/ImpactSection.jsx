import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useLanguage } from "../LanguageContext";
import { Link } from "react-router-dom";

const Counter = ({ target, start }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    if (start) {
      const controls = animate(count, target, {
        duration: 3,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [count, target, start]);

  return <motion.span>{rounded}</motion.span>;
};

const ImpactSection = () => {
  const { t } = useLanguage();
  const [startAnimation, setStartAnimation] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const leftBoxVariants = {
    hidden: { x: '-100vw', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 1 } }
  };

  const rightBoxVariants = {
    hidden: { x: '100vw', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 1 } }
  };

  return (
    <div ref={sectionRef} className="bg-pink-300 text-white p-10 overflow-hidden">
      <h2 className="text-3xl font-bold text-pink-500 mb-4">{t('ourImpact')}</h2>
      <p className="text-lg mb-6">
        {t('impactDescription')}
      </p>
      <Link to="/pad-locator" className="text-white underline mb-4">
        <button className="bg-pink-500 text-white px-4 py-2 rounded-md">{t('viewAll')} →</button>
      </Link>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <motion.div
          className="bg-white text-black p-6 rounded-lg"
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          variants={leftBoxVariants}
        >
          <h3 className="text-3xl font-bold text-pink-600">
            <Counter target={3458381} start={startAnimation} />
          </h3>
          <p>{t('sanitaryPadsDistributed')}</p>
        </motion.div>
        
        <motion.div
          className="bg-pink-500 text-white p-6 rounded-lg"
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          variants={rightBoxVariants}
        >
          <h3 className="text-3xl font-bold">
            <Counter target={416666} start={startAnimation} />
          </h3>
          <p>{t('menstruatorsSupported')}</p>
        </motion.div>

        <motion.div
          className="bg-pink-500 text-white p-6 rounded-lg"
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          variants={leftBoxVariants}
        >
          <h3 className="text-3xl font-bold">
            <Counter target={8051978} start={startAnimation} />
          </h3>
          <p>{t('periodCyclesSupported')}</p>
        </motion.div>

        <motion.div
          className="bg-white text-black p-6 rounded-lg"
          initial="hidden"
          animate={startAnimation ? "visible" : "hidden"}
          variants={rightBoxVariants}
        >
          <h3 className="text-3xl font-bold text-pink-600">
            <Counter target={2082} start={startAnimation} />
          </h3>
          <p>{t('periodWorkshopsConducted')}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactSection;