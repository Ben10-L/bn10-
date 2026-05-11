import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { QuizExperience } from "@/components/QuizExperience";
import { quizSets } from "@/lib/data";

export function generateStaticParams() {
  return quizSets.map((quiz) => ({ slug: quiz.slug }));
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = quizSets.find((item) => item.slug === slug);

  if (!quiz) {
    notFound();
  }

  return (
    <AppShell>
      <QuizExperience quiz={quiz} />
    </AppShell>
  );
}
