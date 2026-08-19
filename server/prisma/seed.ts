import { PrismaClient, Difficulty, QuizStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';

const db = new PrismaClient();
type BankQuestion = { questionText:string; options:string[]; answer:string; explanation:string; category:string };
const titles = [
  'HTML Fundamentals','HTML Forms and Media','CSS Fundamentals','CSS Layout and Flexbox',
  'JavaScript Fundamentals','JavaScript Functions and Scope','JavaScript DOM','JavaScript Async',
  'React Fundamentals','React Components and State','Node.js Fundamentals','Node.js APIs',
  'TypeScript Fundamentals','Web Security','Web APIs and Performance'
];

async function createPdfQuiz(index:number, categoryId:string, bank:BankQuestion[]) {
  const id = `web-pdf-quiz-${String(index + 1).padStart(2, '0')}`;
  const quiz = await db.quiz.upsert({
    where:{id},
    update:{title:titles[index],status:QuizStatus.PUBLISHED,duration:10,maxAttempts:999},
    create:{id,title:titles[index],description:'A 10-question assessment sourced directly from the Web Development MCQ PDF.',categoryId,difficulty:Difficulty.MEDIUM,duration:10,passingScore:60,maxAttempts:999,status:QuizStatus.PUBLISHED}
  });
  if (await db.question.count({where:{quizId:id}}) === 0) {
    const questions = bank.slice(index * 10, index * 10 + 10);
    if (questions.length !== 10) throw new Error('PDF bank does not contain enough complete questions.');
    await db.$transaction(questions.map(x => db.question.create({data:{
      quizId:quiz.id, questionText:x.questionText, marks:1, explanation:x.explanation,
      sourceCategory:x.category,
      options:{create:x.options.map((optionText,i)=>({optionText,isCorrect:'ABCD'[i]===x.answer}))}
    }})));
  }
}

async function main() {
  const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD||'Admin123!',12);
  await db.user.upsert({where:{email:'admin@example.com'},update:{name:'Platform Admin',passwordHash:hash,role:Role.ADMIN,status:'ACTIVE'},create:{name:'Platform Admin',email:'admin@example.com',passwordHash:hash,role:Role.ADMIN}});
  const category=await db.category.upsert({where:{name:'Web Development'},update:{},create:{name:'Web Development',description:'PDF-sourced 10-question quizzes'}});
  // Retain the original imported bank as a non-student-visible source record.
  await db.quiz.updateMany({where:{id:'web-development-pdf-bank'},data:{status:QuizStatus.DRAFT}});
  const bank=JSON.parse(readFileSync(new URL('../data/web-development-mcqs.json',import.meta.url),'utf8')) as BankQuestion[];
  for(let i=0;i<15;i++) await createPdfQuiz(i,category.id,bank);
  // The previous five generated samples remain in the database for auditability,
  // but are hidden from students so the catalogue contains exactly 15 quizzes.
  await db.quiz.updateMany({where:{id:{in:['web-pdf-quiz-16','web-pdf-quiz-17','web-pdf-quiz-18','web-pdf-quiz-19','web-pdf-quiz-20']}},data:{status:QuizStatus.UNPUBLISHED}});
  console.log('Created/updated 15 published topic quizzes with exactly 10 questions each.');
}
main().finally(()=>db.$disconnect());
