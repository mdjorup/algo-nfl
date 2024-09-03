'use client';


import { format } from 'date-fns';

interface DateRenderProps {
  date: Date;
  dateFormat?: string;
}

const DateRender = ({ date, dateFormat }: DateRenderProps) => {
  return <>{format(date, dateFormat ?? "")}</>
}

export default DateRender