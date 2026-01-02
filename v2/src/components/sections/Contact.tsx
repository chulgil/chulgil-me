"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Toast, { useToast } from "@/components/ui/Toast";

const EMAIL = "contact@chulgil.me";

const socialLinks = [
  { name: "GitHub", url: "https://github.com/chulgil", icon: "github" },
  { name: "LinkedIn", url: "#", icon: "linkedin" },
  { name: "Twitter", url: "https://twitter.com/chulgil_lee", icon: "twitter" },
  { name: "Email", url: "mailto:contact@chulgil.me", icon: "email" },
];

export default function Contact() {
  const contentRef = useScrollAnimation<HTMLDivElement>({
    start: "top 70%",
    yOffset: 50,
    stagger: 0.15,
  });
  const { toast, showToast, hideToast } = useToast();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast("이메일이 복사되었습니다");
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = EMAIL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("이메일이 복사되었습니다");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-ebony py-24">
      <div className="section-container">
        <div ref={contentRef} className="text-center">
          {/* Section Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-2xl text-gold">&#9833;</span>
            <h2 className="font-heading text-4xl text-ivory">피날레</h2>
            <span className="text-2xl text-gold">&#9834;</span>
          </div>

          {/* Main Message */}
          <h3 className="font-heading text-3xl md:text-5xl text-ivory mb-8">
            함께 만들어요
          </h3>

          <p className="font-body text-lg text-cream/80 max-w-xl mx-auto mb-12">
            새로운 프로젝트, 협업, 또는 그냥 대화를 나누고 싶으시다면
            언제든 연락해 주세요.
          </p>

          {/* Contact Info */}
          <div className="inline-block bg-charcoal/30 backdrop-blur rounded-lg p-8 mb-12">
            <div className="space-y-4 text-left">
              <button
                onClick={copyEmail}
                className="font-body text-ivory flex items-center gap-3 hover:text-gold transition-colors duration-300 group"
                data-cursor-hover
                data-cursor-text="복사"
              >
                <span className="text-gold">&#9993;</span>
                <span className="border-b border-transparent group-hover:border-gold transition-all duration-300">
                  {EMAIL}
                </span>
                <span className="text-xs text-cream/50 group-hover:text-gold transition-colors">
                  클릭하여 복사
                </span>
              </button>
              <p className="font-body text-ivory flex items-center gap-3">
                <span className="text-gold">&#127760;</span>
                chulgil.me
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-gold/50 flex items-center justify-center text-ivory hover:bg-gold/20 hover:border-gold transition-all duration-300"
                aria-label={link.name}
              >
                <span className="text-sm">{link.name[0]}</span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-24 pt-8 border-t border-charcoal/30">
            <p className="font-body text-sm text-cream/60">
              &copy; 2026 Chulgil Lee. Symphony of Code.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </section>
  );
}
