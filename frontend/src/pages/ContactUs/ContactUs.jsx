import React from "react";
import Navbar from "../Home/Navbar";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We will get back to you soon.");
    e.target.reset();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-12 max-w-5xl">
        <div className="text-center mb-12 animate-slideDown">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Support
          </p>
          <h1 className="hero-title text-4xl text-[var(--text-primary)]">
            Contact Us
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
            Have questions about BuySell? Need help with an order? We're here to
            help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-1 space-y-4 animate-fadeIn">
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold mb-1">Head Office</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                123 Market Street
                <br />
                New York, NY 10001
              </p>
            </div>
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold mb-1">Email Us</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                support@buysell.example.com
                <br />
                admin@buysell.example.com
              </p>
            </div>
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold mb-1">Call Us</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                +91 98765 43210
                <br />
                Mon-Fri, 9am to 6pm
              </p>
            </div>
          </div>

          {/* Form */}
          <div
            className="lg:col-span-2 glass-card p-8 animate-fadeIn"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="font-bold text-2xl mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field-group mb-0">
                  <label className="field-label">Your Name</label>
                  <input
                    type="text"
                    className="field"
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="field-group mb-0">
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    className="field"
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="field-group mb-0">
                <label className="field-label">Subject</label>
                <input
                  type="text"
                  className="field"
                  required
                  placeholder="How can we help?"
                />
              </div>
              <div className="field-group mb-0">
                <label className="field-label">Message</label>
                <textarea
                  className="field"
                  rows={5}
                  required
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-lg mt-2">
                <Send size={18} className="mr-2" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
