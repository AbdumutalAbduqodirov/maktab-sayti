export type Teacher = {
    id: string;
    full_name: string;
    subject: string;
    position: string | null;
    experience_years: number | null;
    bio: string | null;
    photo_url: string | null;
    email: string | null;
    phone: string | null;
  };
  
  export type Achievement = {
    id: string;
    title: string;
    description: string | null;
    student_name: string | null;
    year: number;
    subject: string;
    level: string;
    place: string | null;
    image_url: string | null;
    teacher_id: string | null;
    teachers: { full_name: string } | null;
  };
  
  export type News = {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    cover_url: string | null;
    published_at: string;
  };
  
  export type NewsImage = {
    id: string;
    image_url: string;
    caption: string | null;
  };
  
  export type ScheduleRow = {
    id: string;
    class_name: string;
    weekday: number;
    lesson_number: number;
    subject: string;
    room: string | null;
    teachers: { full_name: string } | null;
  };
  
  export const LEVELS: Record<string, string> = {
    maktab: "Maktab",
    tuman: "Tuman",
    viloyat: "Viloyat",
    respublika: "Respublika",
    xalqaro: "Xalqaro",
  };
  
  export const WEEKDAYS = [
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ];
  
  export function formatDate(iso: string) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
  }