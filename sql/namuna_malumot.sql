insert into teachers (full_name, subject, position, experience_years) values
  ('Abdumutal Abduqodirov', 'Informatika', 'Informatika va robototexnika o''qituvchisi', 5),
  ('Test Ustoz', 'Matematika', 'Oliy toifali o''qituvchi', 12);

insert into achievements (title, student_name, year, subject, level, place, teacher_id)
select 'Robototexnika olimpiadasi', 'Test O''quvchi', 2026, 'Informatika', 'viloyat', '1-o''rin', id
from teachers where subject = 'Informatika' limit 1;

insert into news (title, slug, summary, content) values
  ('Yangi o''quv yili boshlandi', 'yangi-oquv-yili', 'Qisqa mazmun.', 'Yangilikning to''liq matni shu yerda bo''ladi.');

insert into schedule (class_name, weekday, lesson_number, subject, room) values
  ('5-A', 1, 1, 'Matematika', '12'),
  ('5-A', 1, 2, 'Informatika', '21');