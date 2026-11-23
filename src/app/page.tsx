import { CreatePollForm } from "@/components/CreatePollForm";
import { SectionHeading } from "@/components/SectionHeading";

export default function HomePage() {
  return (
    <div className="flex max-w-[800px] flex-col gap-12">
      <SectionHeading
        as="h1"
        eyebrow="New poll"
        title="Find a time that works for everyone"
        lead="Suggest a few times, share one link and see who can make it. No sign-up needed."
      />
      <CreatePollForm />
    </div>
  );
}
