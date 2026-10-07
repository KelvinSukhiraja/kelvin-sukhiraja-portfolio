'use client';
import { useState, type CSSProperties } from 'react';
export function TypePlayground() {
  const [value,setValue]=useState(0);
  return <section className="type-playground shell" aria-labelledby="type-title" style={{'--expression':value/100} as CSSProperties}>
    <div className="section-kicker eyebrow"><h2 id="type-title">A little room to play</h2><span>One thought. Two instincts.</span></div>
    <div className="type-stage" role="img" aria-label="Form and feeling">
      <span className="type-structure" aria-hidden="true">FORM<br />& FEELING</span>
      <em className="type-expression" aria-hidden="true">Form<br /><span>& feeling.</span></em>
      <span className="type-coordinate eyebrow" aria-hidden="true">{String(value).padStart(3,'0')} / 100</span>
    </div>
    <div className="type-control"><label htmlFor="expression">Structure</label><input id="expression" type="range" min="0" max="100" value={value} onChange={event=>setValue(Number(event.target.value))} aria-label="Balance structure and expression" /><span>Expression</span></div>
    <p className="type-note">A small shift can change how everything feels.</p>
  </section>;
}
