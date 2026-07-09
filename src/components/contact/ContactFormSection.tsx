"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { AtSign, Link2, Mail, X as XIcon } from "lucide-react";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com", icon: AtSign },
  { label: "X (Twitter)", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Link2 },
  { label: "Email", href: "mailto:hello@bluesun.build", icon: Mail },
];

export default function ContactFormSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="contact-form" ref={ref}>
      <div className="contact-form__inner">
        <motion.div
          className="contact-form__intro"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="contact-form__label">Let&rsquo;s talk</span>
          <h2 className="contact-form__heading">
            Tell us about <span className="serif">your project.</span>
          </h2>
          <p className="contact-form__desc">
            Fill out the form and a member of our team will reach out
            within one business day. Prefer to connect directly? Find us
            here.
          </p>

          <div className="contact-form__socials">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="contact-form__social-btn liquid-glass"
                aria-label={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.form
          className="contact-form__panel liquid-glass"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <label className="contact-form__field">
            <span>Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </label>

          <label className="contact-form__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com"
            />
          </label>

          <label className="contact-form__field">
            <span>Message</span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us about your project"
            />
          </label>

          <button type="submit" className="contact-form__submit">
            {submitted ? "Message sent" : "Send message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
