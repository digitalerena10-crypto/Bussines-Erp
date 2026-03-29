import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-PK', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-PK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:border-primary-200 transition-all duration-300">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-100 transition-colors">
                    <Clock size={20} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-gray-900 tracking-tight tabular-nums">
                        {formatTime(time)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-0.5">
                        {formatDate(time)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DigitalClock;
