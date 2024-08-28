'use client';


import { format } from 'date-fns';

interface DateRenderProps {
  date: Date;
  dateFormat?: string;
}

const DateRender = ({ date, dateFormat }: DateRenderProps) => {
  return <time dateTime={date.toISOString()}>{format(date, dateFormat ?? "")}</time>
}

export default DateRender