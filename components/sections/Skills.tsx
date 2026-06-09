"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/skills";
import SkillBadge from "@/components/ui/SkillBadge";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-28">
      <ScrollReveal>
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Skills
        </h2>
        <div className="mb-12 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent-purple" />
      </ScrollReveal>

      {/* 컬럼(masonry) 배치 — 각 그룹이 내용 높이만큼만 차지해 빈칸 없이 채워짐 */}
      <div className="gap-x-10 sm:columns-2">
        {skills.map((group, gi) => (
          <div key={group.category} className="mb-10 break-inside-avoid last:mb-0">
            <ScrollReveal delay={gi * 0.1}>
              <h3 className="mb-4 text-lg font-semibold text-muted">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-5">
                {group.items.map((item, ii) => (
                  <motion.div
                    key={`${item}-${ii}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: ii * 0.05 }}
                  >
                    <SkillBadge label={item} />
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
