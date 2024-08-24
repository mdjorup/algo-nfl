import { type ClassValue, clsx } from "clsx";
import { promises as fs } from 'fs';
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const getEvents = async (): Promise<Event[]> => {
  const path = await fs.readFile(process.cwd() + '/src/data/events.json', 'utf8')

  const data = JSON.parse(path)

  return data;
}