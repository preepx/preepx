import React from "react";
import { MapPin, Building2, Briefcase } from "lucide-react";

export default function HiringEventsSection({
  events = [],
  registeredEvents = [],
  onRegister,
}) {
  return (
    <section className="ajd-card" id="ajd-events">
      <div className="ajd-card-head">
        <div>
          <h2>Hiring events & walk-ins</h2>
          <p className="ajd-card-kicker">Fairs, campus drives and on-site interviews this week</p>
        </div>
        <span className="ajd-live-mini">
          <span className="ajd-pulse" /> 3 live
        </span>
      </div>
      <div className="ajd-events">
        {events.map((ev) => (
          <article key={ev.id} className="ajd-event">
            <div className="ajd-event-date">
              <strong>{ev.date}</strong>
              <span>{ev.type}</span>
            </div>
            <div className="ajd-event-body">
              <h3>{ev.title}</h3>
              <p><MapPin size={12} /> {ev.loc} · {ev.time}</p>
              <div className="ajd-event-meta">
                <span><Building2 size={12} /> {ev.companies} companies</span>
                <span><Briefcase size={12} /> {ev.roles} roles</span>
              </div>
            </div>
            <button
              type="button"
              className={`ajd-event-cta ${registeredEvents.includes(ev.id) ? "done" : ""}`}
              onClick={() => onRegister(ev.id)}
              disabled={registeredEvents.includes(ev.id)}
            >
              {registeredEvents.includes(ev.id) ? "Registered" : ev.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
