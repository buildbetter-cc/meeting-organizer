import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        eyebrow="Not found"
        title="We couldn't find that poll"
        lead="The link may be mistyped, or the poll may have been removed. Check the link with the person who sent it."
      />
      <div>
        <Button href="/" variant="secondary">
          Create a new poll
        </Button>
      </div>
    </div>
  );
}
