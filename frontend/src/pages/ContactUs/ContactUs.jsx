import React from "react";
import Navbar from "../Home/Navbar";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We will get back to you.");
    e.target.reset();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-10 max-w-3xl">
        <div className="mb-8 animate-slideDown">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">Contact Us</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Have a question or feedback? Drop us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info */}
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card p-5">
              <div className="w-10 h-10 rounded-lg bg-[rgba(29,78,216,0.10)] flex items-center justify-center text-[var(--brand)] mb-3">
                <Mail size={20} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Email</h3>
              <p className="text-sm text-[var(--text-secondary)]">buysell@college.edu</p>
            </div>
            <div className="glass-card p-5">
              <div className="w-10 h-10 rounded-lg bg-[rgba(29,78,216,0.10)] flex items-center justify-center text-[var(--brand)] mb-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Response Time</h3>
              <p className="text-sm text-[var(--text-secondary)]">We usually reply within a day.</p>
            </div>
          </div>

          {/* Form */}
          <div
            className="lg:col-span-2 glass-card p-6 animate-fadeIn"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="font-bold text-lg mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field-group mb-0">
                  <label className="field-label">Your Name</label>
                  <input type="text" className="field" required placeholder="e.g., Aryan Mehta" />
                </div>
                <div className="field-group mb-0">
                  <label className="field-label">Email</label>
                  <input type="email" className="field" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="field-group mb-0">
                <label className="field-label">Subject</label>
                <input type="text" className="field" required placeholder="What is it about?" />
              </div>
              <div className="field-group mb-0">
                <label className="field-label">Message</label>
                <textarea className="field" rows={4} required placeholder="Write your message..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
