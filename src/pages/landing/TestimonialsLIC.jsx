import { motion } from 'framer-motion';

import Icon from './components/Icon.jsx';
import { EASE, stagger, fadeUp } from './motion.js';

/* Five marks from the shared set rather than a text star glyph, whose weight
   and baseline shift with whatever font the page falls back to. */
const STAR = (
  <span className="flex gap-0.5 text-lic-navy" role="img" aria-label="Rated 5 out of 5">
    {[0, 1, 2, 3, 4].map((i) => (
      <Icon key={i} name="star" className="h-4 w-4" filled />
    ))}
  </span>
);

/*
 * PLACEHOLDER COPY — every quote below is written, not collected. Replace with
 * genuine, permissioned quotes before this page goes live: an invented
 * endorsement presented as a real one is a misleading advertisement under the
 * Consumer Protection Act 2019 and ASCI's endorsement guidelines.
 *
 * Ordered so each row of three carries mixed subject matter rather than three
 * variations on one theme. Deliberately no income figures — the riskiest thing
 * to invent and the hardest to substantiate later.
 */
const ITEMS = [
  {
    name: 'Arjun Mehta',
    meta: 'Pune · cleared IRDA on first attempt',
    quote:
      'The timed mocks were ruthless in the best way. Exam day felt slower than practice — I already knew my pace.',
  },
  {
    name: 'Kavitha N.',
    meta: 'Chennai · new LIC agent',
    quote:
      'Live classes meant I could ask “dumb” questions without judgement. That honesty saved me weeks of confusion.',
  },
  {
    name: 'Rahul Khanna',
    meta: 'Delhi NCR · career switch',
    quote:
      'The dashboard showed my weak chapters in red. I stopped studying what I already knew — and finally used nights efficiently.',
  },
  {
    name: 'Sneha Patil',
    meta: 'Nashik · homemaker turned agent',
    quote:
      'I was sure my English wasn’t strong enough to sit the paper. The live classes switch to Hindi the moment someone looks lost — not once did anyone make me feel small for asking.',
  },
  {
    name: 'Imran Sheikh',
    meta: 'Hyderabad · studied around a full-time job',
    quote:
      'Ninety minutes a night after my shift, and none of it wasted. The course path told me exactly what to open each evening — I never sat there deciding where to start.',
  },
  {
    name: 'Deepak Rawat',
    meta: 'Dehradun · cleared on the second attempt',
    quote:
      'I failed the first time studying alone and decided I wasn’t cut out for it. Turns out I knew the syllabus and couldn’t manage the clock. Twelve timed mocks fixed a problem I didn’t know I had.',
  },
  {
    name: 'Meera Krishnan',
    meta: 'Kochi · joined at 44',
    quote:
      'At forty-four I assumed I’d be the oldest in the room and years behind. Two of my batchmates were older than me. Nobody here treats a late start as a handicap.',
  },
  {
    name: 'Vikram Singh',
    meta: 'Jaipur · first-year agent',
    quote:
      'Rohit doesn’t stop at the exam. He walked me through servicing a client in year three — the renewals nobody warns you about. That’s not a trainer, that’s a mentor.',
  },
  {
    name: 'Ananya Bose',
    meta: 'Kolkata · commerce graduate',
    quote:
      'I arrived with a commerce degree and zero insurance knowledge. The modules assume you know nothing, which was exactly right. I wrote my first policy eleven days after my appointment came through.',
  },
];

/* Cards fan in from their own column: left leans in from the left, right from
   the right. Derived from the index rather than stored per item, so the pattern
   repeats down every row and survives reordering the array. */
const COLUMN_OFFSET = [-36, 0, 36];

/*
 * `overflow-x-clip` on the section: the right-hand column sits at
 * translateX(36px) until its reveal fires, which inflates
 * document.scrollWidth past the viewport and gives the whole page a 2px
 * horizontal scroll. With three offset cards instead of one, that condition
 * now persists much further down the page. Clip rather than hidden — hidden
 * would make the section a scroll container and break `position: sticky` for
 * anything placed inside it later.
 */
const TestimonialsSection = () => (
  <section className="overflow-x-clip bg-lic-offwhite py-20 sm:py-28">
    <motion.div
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger()}
    >
      <motion.h2
        variants={fadeUp}
        className="text-center font-semibold tracking-tight text-lic-charcoal"
        style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.35rem)' }}
      >
        Don&apos;t take our word for it
      </motion.h2>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {ITEMS.map((t, i) => (
          <motion.article
            key={t.name}
            initial={{ opacity: 0, x: COLUMN_OFFSET[i % 3] }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            /* Staggered by column, not by index: at nine cards `i * 0.12` left
               the last one waiting almost a second after its own trigger, out
               of step with the row it sits in. */
            transition={{ duration: 0.65, ease: EASE, delay: (i % 3) * 0.12 }}
            className="relative flex flex-col overflow-hidden rounded-card-lg border border-black/6 bg-white p-7 shadow-soft transition-all duration-250 ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            {/*
              Parked top-right, matching the pull-quote in the business
              section. On the left it sat directly under the rating, which the
              old text stars blurred into but crisp SVG marks collide with.
            */}
            <span
              className="pointer-events-none absolute right-5 top-2 font-serif text-7xl font-bold leading-none text-lic-navy/15"
              aria-hidden
            >
              &ldquo;
            </span>
            <div className="relative flex flex-1 flex-col">
              <div className="text-sm">{STAR}</div>
              <p className="mt-4 text-sm leading-relaxed text-lic-body sm:text-base">{t.quote}</p>
              {/*
                `mt-auto` pins the attribution to the card's floor. Quote
                lengths vary a lot across nine cards, and left to follow the
                text the names landed at a different height in every column of
                the same row.
              */}
              <p className="mt-auto pt-5 text-sm font-bold text-lic-charcoal">{t.name}</p>
              <p className="text-xs text-lic-body">{t.meta}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  </section>
);

export default TestimonialsSection;
