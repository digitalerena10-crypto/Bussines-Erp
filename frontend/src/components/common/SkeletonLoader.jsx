import { motion } from 'framer-motion';

export const Skeleton = ({ className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
            className={`bg-gray-200 rounded-md ${className}`}
        />
    );
};

export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="space-y-4 w-full">
            <Skeleton className="h-8 w-full" />
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 flex-1" delay={i * 0.1} />
                    <Skeleton className="h-10 w-24" delay={i * 0.1 + 0.05} />
                    <Skeleton className="h-10 w-16" delay={i * 0.1 + 0.1} />
                </div>
            ))}
        </div>
    );
};

export const ChartSkeleton = () => {
    return (
        <div className="h-full w-full flex items-end gap-2 px-2">
            {[...Array(12)].map((_, i) => (
                <Skeleton
                    key={i}
                    className="flex-1"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                    delay={i * 0.05}
                />
            ))}
        </div>
    );
};
