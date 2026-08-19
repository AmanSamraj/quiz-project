-- CreateEnum
CREATE TYPE "TimerMode" AS ENUM ('PER_QUESTION', 'FULL_QUIZ', 'NONE');

-- CreateEnum
CREATE TYPE "QuestionAnswerType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "currentQuestion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentQuestionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "currentQuestionStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionTimeLimit" INTEGER;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "questionAnswerType" "QuestionAnswerType" NOT NULL DEFAULT 'SINGLE_CHOICE',
ADD COLUMN     "timerMode" "TimerMode" NOT NULL DEFAULT 'FULL_QUIZ';

-- CreateTable
CREATE TABLE "AnswerSelection" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "AnswerSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerSelection_answerId_optionId_key" ON "AnswerSelection"("answerId", "optionId");

-- AddForeignKey
ALTER TABLE "AnswerSelection" ADD CONSTRAINT "AnswerSelection_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerSelection" ADD CONSTRAINT "AnswerSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
