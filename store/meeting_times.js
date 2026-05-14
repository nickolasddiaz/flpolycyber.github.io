// using new Temporal instead of legacy date

const WeekDay = Object.freeze({
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
});

export class MeetingTimes{
    constructor(week, timeString){
        const period = timeString.slice(-2); // "pm"
        const time = timeString.slice(0, -2); // "5:30"
        const [hour, minute] = time.split(':').map(Number);
        const isPM = period.toLowerCase() === 'pm';
        this.weekday = week;
        this.hour = hour + (isPM ? 12 : 0);
        this.minute = minute;
        this.timeZone = 'America/New_York';
    }

    nextMeetingTime() { // returns ZonedDateTime
        const now = Temporal.Now.zonedDateTimeISO(this.timeZone);
        let daysUntil = (this.weekday - now.dayOfWeek + 7) % 7;

        const candidate = now.add({ days: daysUntil }).with({
            hour: this.hour,
            minute: this.minute,
            second: 0,
            millisecond: 0,
            microsecond: 0,
            nanosecond: 0
        });

        if (daysUntil === 0 && Temporal.ZonedDateTime.compare(candidate, now) <= 0) {
            return candidate.add({ days: 7 });
        }

        return candidate;
    }

    stringnextMeetingTime(){
        return this.nextMeetingTime().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    

    nextMeetingDuration() { // returns Temporal.Duration
        return this.nextMeetingTime().since(Temporal.Now.zonedDateTimeISO());
    }

    stringnextMeetingDuration(){
        const nextMeeting = this.nextMeetingDuration()
        const balanced = nextMeeting.round({ largestUnit: 'days', smallestUnit: 'minutes' });
        const { days, hours, minutes } = balanced;

        if (days > 15) return `Next Semester`;
        if (days > 0) return `${days} days, ${hours} hours`;
        if (hours > 0) return `${hours} hours ${minutes} minutes`;
        if (minutes > 5) return `${minutes} minutes`;
        return "in session";
    }
}


// General Meetings: Mondays @ 5:30pm
// Defensive Meetings: Wednesdays @ 5:30pm
// Offensive Meetings: Fridays @ 5:30pm

export const meeting_times = {
    "General Meetings": new MeetingTimes(WeekDay.MONDAY, "5:30pm"),
    "Defensive Meetings": new MeetingTimes(WeekDay.WEDNESDAY, "5:30pm"),
    "Offensive Meetings": new MeetingTimes(WeekDay.FRIDAY, "5:30pm"),
};