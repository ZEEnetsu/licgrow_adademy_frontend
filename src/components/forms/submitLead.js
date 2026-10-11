/**
 * Where every public form ends up — the apply form, the call-back request and
 * the contact form.
 *
 * TODO(backend): nothing is sent yet. The reference build ships these forms
 * as drafts ("your details are not sent anywhere yet"), and the pages say so
 * next to every submit button. To go live, replace the body with a real
 * request (e.g. POST /api/leads with { kind, ...data }), reject on failure so
 * the form can show an error, and remove the draft notes from the page copy.
 *
 * @param {'register' | 'callback' | 'contact'} kind
 * @param {Record<string, unknown>} data
 */
export function submitLead(kind, data) {
  void kind;
  void data;
  return new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });
}
