'use client';


import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface DateRenderProps {
  date: string | Date;
  dateFormat?: string;
}

const DateRender = ({ date, dateFormat }: DateRenderProps) => {

  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(format(new Date(date), dateFormat ?? ""));
  }, [date, dateFormat]);

  return <>{formattedDate}</>;
}

export default DateRender