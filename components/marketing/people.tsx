import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Illustrative people and scenes for the public site. All images are
 * AI-generated, fictional people (public/images/people, public/images/scenes):
 * portraits are 256×256 WebP, scenes 1200×800 WebP.
 */

export const people = {
  drKim: "/images/people/dr-kim.webp",
  mei: "/images/people/mei.webp",
  jp: "/images/people/jp.webp",
  nurse: "/images/people/nurse.webp",
  lawyer: "/images/people/lawyer.webp",
  examiner: "/images/people/examiner.webp",
  interpreter: "/images/people/interpreter.webp",
  candidate: "/images/people/candidate.webp",
  sofia: "/images/people/sofia.webp",
  linh: "/images/people/linh.webp",
  // Fictional staff for the /staff-training readiness example.
  priya: "/images/people/priya.webp",
  tom: "/images/people/tom.webp",
  aisha: "/images/people/aisha.webp",
  daniel: "/images/people/daniel.webp",
  mai: "/images/people/mai.webp",
  lucas: "/images/people/lucas.webp",
  hana: "/images/people/hana.webp",
  mateo: "/images/people/mateo.webp",
} as const;

export type PersonKey = keyof typeof people;

export const scenes = {
  interpreterDesk: {
    src: "/images/scenes/interpreter-desk.webp",
    alt: "An interpreter wearing headphones practises out loud at her desk.",
  },
  clinic: {
    src: "/images/scenes/clinic-consultation.webp",
    alt: "A doctor speaks with an older patient while an interpreter takes notes beside her.",
  },
  examPrep: {
    src: "/images/scenes/exam-prep.webp",
    alt: "A nurse in scrubs rehearses a speaking exam at her kitchen table in the evening.",
  },
  team: {
    src: "/images/scenes/team-training.webp",
    alt: "A small group of interpreters practising together around a table with laptops and headphones.",
  },
  legal: {
    src: "/images/scenes/legal-meeting.webp",
    alt: "An interpreter speaks with a client in a meeting with a lawyer.",
  },
  retail: {
    src: "/images/scenes/retail-service.webp",
    alt: "A retail team member in an apron helps a customer choose a bowl in a homewares store.",
  },
  eventVolunteer: {
    src: "/images/scenes/event-volunteer.webp",
    alt: "A volunteer in a high-visibility vest points the way for visitors with backpacks in a stadium concourse.",
  },
  contactCentre: {
    src: "/images/scenes/contact-centre.webp",
    alt: "A contact-centre agent wearing a headset talks with a caller at his desk.",
  },
  healthReception: {
    src: "/images/scenes/health-reception.webp",
    alt: "A hospital receptionist checks in an older patient and his daughter at the front desk.",
  },
  managerReview: {
    src: "/images/scenes/manager-review.webp",
    alt: "A manager and a colleague review a team progress list on a laptop.",
  },
  hotel: {
    src: "/images/scenes/hotel-front-desk.webp",
    alt: "A hotel front-desk staff member welcomes two guests with suitcases.",
  },
  // Marketplace landing (/sell-practice-courses).
  creatorStudio: {
    src: "/images/scenes/creator-studio.webp",
    alt: "An exam coach with headphones around her neck writes notes for a practice conversation at her desk.",
  },
  trainerWhiteboard: {
    src: "/images/scenes/trainer-whiteboard.webp",
    alt: "A workplace trainer plans customer conversation scenarios with sticky notes on a whiteboard while a colleague watches.",
  },
  learnerHeadphones: {
    src: "/images/scenes/learner-headphones.webp",
    alt: "A young man wearing headphones speaks out loud in a practice conversation on his laptop at home.",
  },
  tutorSession: {
    src: "/images/scenes/tutor-session.webp",
    alt: "A tutor and her student look at a tablet together at a café table, smiling.",
  },
} as const;

export type SceneKey = keyof typeof scenes;

/** Round portrait of a demo person. Decorative by default (alt=""). */
export function Portrait({
  person,
  size,
  className,
  alt = "",
}: {
  person: PersonKey;
  /** Rendered size in CSS pixels (largest breakpoint). */
  size: number;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={people[person]}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={cn("rounded-full bg-gray-200 object-cover", className)}
    />
  );
}

/** Overlapping row of portraits. */
export function PortraitStack({
  persons,
  size = 40,
  className,
}: {
  persons: readonly PersonKey[];
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex -space-x-2", className)} aria-hidden>
      {persons.map((person) => (
        <Portrait key={person} person={person} size={size} className="ring-2 ring-paper" />
      ))}
    </span>
  );
}

/**
 * Rounded scene photo that fills its box. Give the wrapper an aspect ratio or
 * height via className. Set `priority` only for the one above-the-fold hero.
 */
export function ScenePhoto({
  scene,
  sizes,
  className,
  priority = false,
  decorative = false,
}: {
  scene: SceneKey;
  sizes: string;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gray-100", className)}>
      <Image
        src={scenes[scene].src}
        alt={decorative ? "" : scenes[scene].alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
