import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 1.5, formatter = (v) => v }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration,
            onUpdate: (latest) => setCount(latest),
            ease: "easeOut"
        });
        return () => controls.stop();
    }, [value, duration]);

    return <span>{formatter(Math.floor(count))}</span>;
};

export default AnimatedCounter;
