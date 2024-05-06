import { formatDistanceToNow } from "date-fns";

export const objIsEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

export const getRelativeTime = (serverTimeStamp) => {
    // Check if serverTimeStamp is null
    if (serverTimeStamp === null) {
        // Handle the null case, e.g., return a default value or an error message
        return "Just now";
    }

    const date = new Date(serverTimeStamp.seconds * 1000 + serverTimeStamp.nanoseconds / 1000000);
    return formatDistanceToNow(date, { addSuffix: true });
};
