"use client";

interface SectionHeaderProps {
  title: string;
  leftNote?: string;
  rightNote?: string;
  className?: string;
}

/**
 * Reusable section header with musical note decorations
 * Reduces duplication across About, Skills, Projects, and Contact sections
 */
export default function SectionHeader({
  title,
  leftNote = "♩",
  rightNote = "♪",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-16 ${className}`}>
      <span className="text-2xl text-gold" aria-hidden="true">
        {leftNote}
      </span>
      <h2 className="font-heading text-4xl text-ebony">{title}</h2>
      <div className="flex-1 h-px bg-charcoal/20" aria-hidden="true" />
      <span className="text-2xl text-gold" aria-hidden="true">
        {rightNote}
      </span>
    </div>
  );
}
