
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

export const getIsoDateTimeString = (): string => {
  const date = new Date();
  return date.toISOString();
};

export const convertToDateTime = (date: string | undefined): Date | undefined => {
  if (!date) {
    return undefined;
  }
  return new Date(date);
};

export const convertDateTimeToString = (date: Date | null): string | undefined => {
  if (!date) {
    return undefined;
  }
  return date.toISOString();
};