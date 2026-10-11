import { useState } from 'react';

import { submitLead } from './submitLead.js';

/*
 * Validation messages, verbatim from the reference's `data-err-hi` /
 * `data-err-en` attributes (src/pages/site/index.html, apply section).
 * `message` is new for the contact form and written in both languages.
 */
const ERR = {
  name: { hi: 'कृपया अपना नाम लिखें।', en: 'Please enter your name.' },
  mobile: { hi: 'कृपया 10 अंकों का मोबाइल नंबर लिखें।', en: 'Please enter a 10-digit mobile number.' },
  email: { hi: 'कृपया सही ईमेल पता लिखें।', en: 'Please enter a valid email address.' },
  consent: {
    hi: 'आगे बढ़ने के लिए कृपया सहमति वाले बॉक्स पर टिक करें।',
    en: 'Please tick the consent box to continue.',
  },
  message: { hi: 'कृपया अपना संदेश लिखें।', en: 'Please write your message.' },
};

const RULES = {
  name: (v) => (String(v).trim() ? null : ERR.name),
  // Same rule as the reference's pattern="[0-9]{10}", tolerating spaces.
  mobile: (v) => (/^[0-9]{10}$/.test(String(v).replace(/\s+/g, '')) ? null : ERR.mobile),
  email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? null : ERR.email),
  consent: (v) => (v ? null : ERR.consent),
  message: (v) => (String(v).trim() ? null : ERR.message),
};

function check(fields, values) {
  const out = {};
  for (const f of fields) {
    const e = RULES[f]?.(values[f] ?? '');
    if (e) out[f] = e;
  }
  return out;
}

/**
 * Small form state machine: values, per-field bilingual errors, and
 * idle → sending → done. Errors show on blur and on submit; editing a field
 * clears its error. On a failed submit the first invalid field gets focus.
 *
 * `fields` lists the names to validate; `idPrefix` maps a field name to its
 * input id (`${idPrefix}-${name}`) for focusing.
 */
export function useLeadForm({ kind, initial, fields, idPrefix }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const set = (name, value) => {
    setValues((s) => ({ ...s, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  const blur = (name) => {
    if (!fields.includes(name)) return;
    const e = check([name], values)[name];
    setErrors((prev) => {
      const next = { ...prev };
      if (e) next[name] = e;
      else delete next[name];
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = check(fields, values);
    setErrors(found);
    const first = fields.find((f) => found[f]);
    if (first) {
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    await submitLead(kind, values);
    setStatus('done');
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setStatus('idle');
  };

  return { values, errors, status, set, blur, submit, reset };
}
