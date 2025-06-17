// d:\sources\qlct\qltc-backend\src\utils\dayjs.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone'; // Optional: if you use tz()
import relativeTime from 'dayjs/plugin/relativeTime'; // Optional: if you use fromNow(), etc.
import 'dayjs/locale/vi'; // Optional: if backend needs locale-specific formatting

// Extend dayjs with all necessary plugins
dayjs.extend(utc);
dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

dayjs.locale('vi'); // Optional: set default locale for backend

export default dayjs;