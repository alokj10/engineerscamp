
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const getCurrentDateTime = (timezone?: string): string => {
  const date = timezone 
    ? toZonedTime(new Date(), timezone)
    : new Date();
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const getCurrentDate = (timezone?: string): string => {
  const date = timezone 
    ? toZonedTime(new Date(), timezone)
    : new Date();
  return format(date, 'yyyy-MM-dd');
};

export const getCurrentDateTimeShort = (timezone?: string): string => {
  const date = timezone 
    ? toZonedTime(new Date(), timezone)
    : new Date();
  return format(date, 'MMM dd yyyy HH:mm');
};

export const getCurrentDateTimeLong = (timezone?: string): string => {
  const date = timezone 
    ? toZonedTime(new Date(), timezone)
    : new Date();
  return format(date, 'MMM dd yyyy HH:mm:ss');
};

export const getActiveTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
