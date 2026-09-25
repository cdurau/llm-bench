import { format, addDays, subDays, isSameDay, parse, isAfter, isBefore, startOfDay } from 'date-fns';

export const getToday = (): Date => startOfDay(new Date());

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const addOneDay = (date: Date): Date => addDays(date, 1);
export const subOneDay = (date: Date): Date => subDays(date, 1);
export const isDateFuture = (date: Date): boolean => isAfter(date, getToday());
export const isDatePast = (date: Date): boolean => isBefore(date, getToday());
