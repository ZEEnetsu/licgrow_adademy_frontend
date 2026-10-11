/**
 * Source of truth for /benefits.
 *
 * The figures, rates, eligibility rules and tables here are LIC's, reproduced
 * exactly. Everything around them — the chapter framing, the section intros,
 * the bridges between chapters — is written for this page, so the handbook
 * reads as one argument rather than four pasted circulars.
 *
 * The arc: Earn → Secure → Fund → Climb.
 *
 * Block vocabulary consumed by DocBlocks.jsx:
 *   p       paragraph
 *   ul      list; items are strings, or { term, t } for a definition row
 *   table   { head, rows, foot? }
 *   note    { tone: 'info' | 'tip' | 'warn', title, t }
 *   formula { lines, caption }
 *   h4      sub-heading inside a section
 */

export const META = {
  eyebrow: 'Agent Handbook',
  title: 'Benefits, end to end',
  standfirst:
    'Every rupee an LIC agent can earn, claim, borrow against or qualify for — the commission ladder, the safety net, the advances, and the seven clubs. Written out in full, in the order the questions actually arrive.',
  stats: [
    { v: '4', l: 'Chapters' },
    { v: '7', l: 'Club tiers' },
    { v: '25%', l: 'Peak first-year rate' },
    { v: '₹0', l: 'To begin' },
  ],
};

export const CHAPTERS = [
  /* ───────────────────────────── 1 — EARN ───────────────────────────── */
  {
    id: 'sales-incentives',
    num: '01',
    phase: 'Earn',
    title: 'Sales Incentives',
    kicker: 'How the money actually arrives',
    summary:
      'Commission is not a bonus paid at the end of a good year. It is the mechanism itself.',
    intro: [
      {
        k: 'p',
        t: 'Start here, because everything in the three chapters that follow is calculated from this one number. Your commission is not a salary and it is not a target-linked payout — it is a fixed share of every premium your policyholders pay, for as long as they keep paying it.',
      },
      {
        k: 'p',
        t: 'That has one consequence worth sitting with before you read the rates: the policy you write this month is not a transaction that closes. It is an annuity that pays you every year the client renews. A modest book written carefully in year one is still paying in year twelve.',
      },
    ],
    sections: [
      {
        id: 'commission-rate-card',
        title: 'The rate card',
        blocks: [
          {
            k: 'p',
            t: 'On any standard policy, under standard tables and terms, commission is paid at the following share of the premium the policyholder pays. Read it as a schedule that runs down the life of the policy rather than four separate perks.',
          },
          {
            k: 'table',
            head: ['Policy year', 'You receive', 'Basis'],
            rows: [
              ['Year 1', 'Up to 25%', 'Of the first-year premium'],
              ['Year 1 — bonus', '+40%', 'Of the first-year commission, not the premium'],
              ['Years 2 and 3', 'Up to 7.5%', 'Of each premium paid'],
              [
                'Year 4 onward',
                'Up to 5%',
                'Of each premium, for as long as the policy continues',
              ],
            ],
            foot: 'Rates are the standard ceiling and vary by plan and term.',
          },
          {
            k: 'note',
            tone: 'tip',
            title: 'Read the second row carefully',
            t: 'The 40% bonus is calculated on your first-year commission, not on the premium. On a policy paying ₹12,500 in first-year commission, the bonus is ₹5,000 — which is why the first year of a well-written policy is worth roughly 35% of the premium, not 25%.',
          },
        ],
      },
      {
        id: 'renewal-commission',
        title: 'Renewal commission',
        blocks: [
          {
            k: 'p',
            t: 'Renewal commission is the part of the structure that turns a job into a book of business. It arrives without a new sale, without a new client, and without a new conversation — provided the policies you already wrote stay alive.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Years 2 and 3',
                t: 'You earn 7.5% of the premiums your clients pay in the second and third years, under standard plans and terms. This is the early income boost, and it comes entirely from keeping existing policies active.',
              },
              {
                term: 'Year 4 onward',
                t: 'From the fourth year you receive 5% of every premium paid annually, for as long as clients renew — a steady base that compounds as the book grows.',
              },
              {
                term: 'Renewals are the condition',
                t: 'This income depends on clients actually paying their renewal premiums. A lapsed policy stops paying you at the same moment it stops protecting them.',
              },
              {
                term: 'Which makes the reminder your job',
                t: 'Prompting clients before a premium falls due is a genuine service — it prevents a gap in their coverage — and it protects your own earnings. The two interests point the same way.',
              },
            ],
          },
        ],
      },
      {
        id: 'bonus-commission',
        title: 'Bonus commission',
        blocks: [
          {
            k: 'p',
            t: 'The 40% bonus on first-year commission is not automatic at the start. It is earned against two thresholds, and after enough consecutive years of clearing them, it stops being conditional at all.',
          },
          {
            k: 'ul',
            items: [
              { term: 'What it pays', t: 'An extra 40% of your first-year commission.' },
              {
                term: 'What you must do',
                t: 'Insure at least 6 lives in the year, and collect a minimum of ₹50,000 in total premium in that year.',
              },
              {
                term: 'After 5 consecutive years',
                t: 'Earn the bonus five years running and the sixth year is granted automatically, even if you miss the thresholds that year.',
              },
              {
                term: 'After 15 years as an agent',
                t: 'The bonus becomes automatic outright, regardless of the year’s performance.',
              },
            ],
          },
          {
            k: 'note',
            tone: 'info',
            title: 'Six lives, not six policies',
            t: 'The threshold counts lives insured. Two policies written on the same life do not count twice toward the six.',
          },
        ],
      },
      {
        id: 'hereditary-commission',
        title: 'Hereditary commission',
        blocks: [
          {
            k: 'p',
            t: 'This is the clause that makes the book genuinely yours: renewal commission does not stop at your death. If you have served two years as an active agent and written at least ₹1 lakh of policies, the stream continues to your nominee or heirs.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'What passes on',
                t: 'Renewal commissions on your existing book continue to your heirs or nominee, provided you had completed two years as an active agent with ₹1 lakh in policies at the time of death.',
              },
              {
                term: 'Why it matters',
                t: 'The work you did building the book keeps supporting your family after you, rather than reverting to the insurer.',
              },
              {
                term: 'What it changes today',
                t: 'It reframes every renewal you protect as something you are building for two generations, not one.',
              },
            ],
          },
          { k: 'h4', t: 'Claiming hereditary commission (HRC)' },
          {
            k: 'p',
            t: 'The paperwork branches on two things: whether a valid nomination exists, and how much money is involved. Work down this list in order.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Request letter',
                t: 'A written request from the claimant, to open the process.',
              },
              { term: 'Office note', t: 'An office note recommending payment to the nominee.' },
              { term: 'Death certificate', t: 'The original certificate must be submitted.' },
              {
                term: 'Where a valid nomination exists',
                t: 'Add Annexure H, listing all legal heirs and signed by all Class I legal heirs.',
              },
              {
                term: 'Where no valid nomination exists',
                t: 'Submit Annexure H together with Annexure I — the declaration in indemnity and agreement.',
              },
              {
                term: 'Waiving legal evidence of title',
                t: 'Submit the annexure prescribed for dispensing with legal evidence of title.',
              },
            ],
          },
          {
            k: 'table',
            head: ['Amount claimed', 'Document required'],
            rows: [
              ['Less than ₹15,000', 'Form J – I'],
              ['₹15,000 to ₹1,10,000', 'Form J – I (A)'],
              ['Above ₹1,10,000', 'Succession certificate from a competent court'],
            ],
            foot: 'Legal evidence of title can be waived for amounts up to ₹1,10,000.',
          },
          { k: 'h4', t: 'Renewal commission after termination (ERC)' },
          {
            k: 'p',
            t: 'An agency ending does not automatically end the renewal stream. An agent may continue to receive renewal commission after termination by satisfying any one of three routes.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Route 1 — service plus a live book',
                t: 'Fulfilled the Minimum Business Guarantee (MBG) for at least 5 years since appointment, and had 25 lives insured as of one year before termination (the end of the previous agency year).',
              },
              {
                term: 'Route 2 — long service',
                t: 'Fulfilled the MBG for at least 10 years since appointment.',
              },
              {
                term: 'Route 3 — incapacity',
                t: 'Terminated under clause (m) of sub-regulation (1) of regulation 16 — physical or mental incapacity to perform an agent’s duties — having fulfilled the MBG for at least 2 years intermittently, with 12 lives insured.',
              },
            ],
          },
        ],
      },
      {
        id: 'worked-example',
        title: 'A worked example',
        blocks: [
          {
            k: 'p',
            t: 'Rates in a table are abstract. Here is the same rate card applied to three policies across their first ten years, so the shape of the income is visible. Each column is one policy, held to term, premium paid annually.',
          },
          {
            k: 'table',
            head: ['', '₹25,000 premium', '₹50,000 premium', '₹1,00,000 premium'],
            rows: [
              ['Year 1 commission (25%)', '₹6,250', '₹12,500', '₹25,000'],
              ['Year 1 bonus (40% of above)', '₹2,500', '₹5,000', '₹10,000'],
              ['Year 2 (7.5%)', '₹1,875', '₹3,750', '₹7,500'],
              ['Year 3 (7.5%)', '₹1,875', '₹3,750', '₹7,500'],
              ['Years 4–10 (5% × 7)', '₹8,750', '₹17,500', '₹35,000'],
              ['Ten-year total', '₹21,250', '₹42,500', '₹85,000'],
            ],
            foot:
              'Illustrative. Straight arithmetic on the published ceiling rates above — not a quote, projection or guarantee. Actual rates vary by plan and term.',
          },
          {
            k: 'note',
            tone: 'tip',
            title: 'The number worth noticing',
            t: 'In every column, the years 4–10 row is larger than the year-one row. Past the third year, the policy you already sold is out-earning the sale itself. That is the whole argument for servicing a book rather than chasing one.',
          },
        ],
      },
    ],
    bridge:
      'Commission explains the upside. It says nothing about what happens when you are ill, when you retire, or when you are no longer there — which is what the next chapter is for.',
  },

  /* ──────────────────────────── 2 — SECURE ──────────────────────────── */
  {
    id: 'special-benefits',
    num: '02',
    phase: 'Secure',
    title: 'Special Benefits',
    kicker: 'The floor beneath the income',
    summary:
      'Gratuity, term cover, group insurance and pension — the part of the package that pays when you cannot.',
    intro: [
      {
        k: 'p',
        t: 'The usual objection to self-employment is the missing safety net: no gratuity, no group cover, no pension, no one to catch you. That objection does not survive contact with this chapter.',
      },
      {
        k: 'p',
        t: 'Four instruments sit underneath the commission structure. Gratuity rewards length of service. Term assurance and group insurance cover your life while you are working. The pension schemes handle what comes after. Each has its own arithmetic, and the arithmetic is worth knowing precisely.',
      },
    ],
    sections: [
      {
        id: 'gratuity',
        title: 'Gratuity',
        blocks: [
          {
            k: 'p',
            t: 'Gratuity is a lump sum earned by staying. It is calculated from your renewal commission over fifteen agency years, which means it is not a flat award — a larger book produces a larger gratuity.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'The basic test',
                t: '15 qualifying years of service and age 60. Both conditions must be met; eligibility begins on the date the second one is satisfied.',
              },
              {
                term: 'After leaving LIC',
                t: 'Any agent who has left LIC service remains eligible, provided the 15 years were completed.',
              },
              { term: 'Choosing when to take it', t: 'You may opt to take gratuity at 60 or at 65.' },
              {
                term: 'Giving notice',
                t: 'Written notice must reach the Senior Divisional Manager before you turn 59.',
              },
              {
                term: 'Approval route',
                t: 'The option letter goes to the Divisional Office with the Senior Branch Manager’s recommendation.',
              },
              {
                term: 'The option is final',
                t: 'Once chosen, it cannot be altered — so the decision at 59 is the decision.',
              },
              {
                term: 'If LIC pays late',
                t: 'Payment delayed beyond one month carries penal interest, at the same rate applied to policy claims.',
              },
            ],
          },
          { k: 'h4', t: 'Who qualifies' },
          {
            k: 'p',
            t: 'Meeting any one of the following is sufficient — they are alternatives, not a checklist.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Service and age',
                t: '15 or more qualifying years worked continuously as an agent, and at least 60 years old.',
              },
              {
                term: 'Service and termination',
                t: '15 or more qualifying years, with the agency terminated for reasons other than Rule 15 [b] or [c], or Rule 16(1) [a], [b] or [c].',
              },
              { term: 'Death in service', t: 'The agent dies while the agency is still active.' },
              {
                term: 'Incapacitation',
                t: 'Confirmed in appointment, with the agency terminated due to mental or physical incapacitation under Rule 16(m).',
              },
            ],
          },
          {
            k: 'note',
            tone: 'info',
            title: 'Missing your business quota does not forfeit gratuity',
            t: 'An agent terminated under Rule 13 for not meeting business quotas, but holding 15 or more qualifying years, remains eligible.',
          },
          { k: 'h4', t: 'How it is calculated' },
          {
            k: 'p',
            t: 'Six steps, in order. The only input you need is your renewal commission history.',
          },
          {
            k: 'ul',
            items: [
              { term: 'Step 1', t: 'Identify the relevant date — the date eligibility is established.' },
              { term: 'Step 2', t: 'Take the 15 agency years immediately preceding that date.' },
              {
                term: 'Step 3',
                t: 'Sum the renewal commission earned during the qualifying years within those 15 agency years.',
              },
              { term: 'Step 4', t: 'Divide that total by 180 to get the eligible rate of gratuity.' },
              { term: 'Step 5', t: 'Count your total qualifying years.' },
              { term: 'Step 6', t: 'Apply the formula below.' },
            ],
          },
          {
            k: 'formula',
            lines: [
              'eligibleRate = totalRenewalCommission / 180',
              '',
              'gratuity = (eligibleRate × 15)',
              '         + ½ × (eligibleRate × qualifyingYearsOver15)',
              '',
              '// qualifyingYearsOver15 is counted up to 25 years',
            ],
            caption:
              'The divisor 180 is 15 years × 12 months — the calculation is monthly at heart.',
          },
          { k: 'h4', t: 'Worked example' },
          {
            k: 'formula',
            lines: [
              'highest commission over 15 years = ₹2,00,000',
              'total across the 15 years        = ₹30,00,000',
              '',
              'eligibleRate = 30,00,000 / 180   = ₹16,666.67',
              '',
              'gratuity = (16,666.67 × 15)       = ₹2,50,000.00',
              '         + ½ × (16,666.67 × 1)    = ₹    8,333.33',
              '                                    ─────────────',
              'total                             = ₹2,58,333.33',
            ],
            caption:
              'The source states the ₹2,58,333.33 total without naming the service length; it resolves to exactly one qualifying year beyond 15, i.e. 16 qualifying years.',
          },
          {
            k: 'note',
            tone: 'warn',
            title: 'Two different ceilings appear in the source material',
            t: 'The eligibility rules state a maximum of ₹3,00,000, while the calculation rules state a maximum of ₹5,00,000. These cannot both be current. Confirm the applicable ceiling against the latest circular before relying on either figure.',
          },
          { k: 'h4', t: 'If the agent dies in service' },
          {
            k: 'p',
            t: 'Where death occurs before 15 years are complete, the calculation adapts rather than failing — the divisor changes to reflect actual service.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Use actual years',
                t: 'Where service is under 15 years, the actual number of qualifying years is used.',
              },
              {
                term: 'A different divisor',
                t: 'The eligibility rate becomes total renewal commission ÷ (12 × actual years of service), in place of the standard 180.',
              },
            ],
          },
        ],
      },
      {
        id: 'term-insurance',
        title: 'Term insurance',
        blocks: [
          {
            k: 'p',
            t: 'Term assurance is granted on the strength of your own book. The sum assured is set by the average annual renewal commission you earned across the three agency years immediately before death — so the cover scales with the business you built.',
          },
          {
            k: 'table',
            head: ['Average annual renewal commission', 'Term assurance'],
            rows: [
              ['Up to ₹5,000', '₹25,000'],
              ['₹5,001 to ₹10,000', '₹50,000'],
              ['₹10,001 to ₹50,000', '₹1,00,000'],
              ['₹50,000 and above', '₹1,50,000'],
            ],
            foot: 'Averaged over the three agency years immediately preceding death.',
          },
        ],
      },
      {
        id: 'group-insurance',
        title: 'Group insurance',
        blocks: [
          {
            k: 'p',
            t: 'Separate from term assurance, and considerably larger. Group cover is open to every agent aged 18 to 69 (next birthday), and the cover band widens with each stage of service.',
          },
          {
            k: 'table',
            head: ['Agency service', 'Life cover', 'Premium'],
            rows: [
              ['Up to 3 years', '₹5 lakh', '₹1,800 + GST'],
              ['Above 3 to 5 years', '₹7.5 lakh', '₹2,700 + GST'],
              ['Above 5 to 10 years', '₹10 lakh', '₹3,600 + GST'],
              ['Above 10 years', '₹15 lakh', '₹5,400 + GST'],
            ],
          },
          { k: 'h4', t: 'Conditions' },
          {
            k: 'ul',
            items: [
              { term: 'Eligibility', t: 'Any agent with at least one year of service may join.' },
              { term: 'In force since', t: '1 September 2007.' },
              { term: 'Age limit', t: 'Cover runs to 69 years of age.' },
              {
                term: 'How the premium is paid',
                t: 'Deducted from commission between July and September — there is no separate payment to remember.',
              },
            ],
          },
          {
            k: 'note',
            tone: 'tip',
            title: 'Worth comparing against the open market',
            t: '₹15 lakh of life cover for ₹5,400 plus GST, deducted automatically from commission, is priced well below what the same agent would pay retail.',
          },
        ],
      },
      {
        id: 'pension-scheme',
        title: 'Pension schemes',
        blocks: [
          {
            k: 'p',
            t: 'Three schemes appear in the agent literature, and they form a sequence rather than a menu — each was superseded by the next. Knowing which is which matters mainly when reading older paperwork.',
          },
          { k: 'h4', t: 'Swavalamban' },
          {
            k: 'ul',
            items: [
              {
                term: 'What it was',
                t: 'Launched September 2010 as a co-contributory pension scheme encouraging unorganised-sector workers to save for retirement.',
              },
              {
                term: 'The government’s share',
                t: 'The Central Government added ₹1,000 to each NPS account where the subscriber saved between ₹1,000 and ₹12,000 in a financial year.',
              },
              {
                term: 'How long that lasted',
                t: 'Government contribution ran only up to financial year 2016-17.',
              },
              {
                term: 'Who could join',
                t: 'Indian citizens not covered by any statutory pension or provident scheme.',
              },
              {
                term: 'Who it reached',
                t: 'State co-contributory scheme members, Aanganwaadi workers, construction workers, weavers, fishermen, farmers and dairy workers, among others.',
              },
              {
                term: 'Administration',
                t: 'Managed by the Pension Fund Regulatory & Development Authority (PFRDA) on government grants, operating through 62 Aggregators and 71 Points of Presence.',
              },
            ],
          },
          { k: 'h4', t: 'Atal Pension Yojana' },
          {
            k: 'ul',
            items: [
              {
                term: 'Why it replaced Swavalamban',
                t: 'Swavalamban’s uptake was limited because the benefit at age 60 was never made clear. APY was designed to fix exactly that.',
              },
              {
                term: 'When',
                t: 'Announced in the 2015-16 Budget and launched by the Prime Minister on 9 May 2015.',
              },
              {
                term: 'Effect on Swavalamban',
                t: 'Enrollment in Swavalamban stopped on APY’s launch.',
              },
              {
                term: 'Migration',
                t: 'Eligible Swavalamban subscribers were moved to APY automatically unless they chose to opt out.',
              },
            ],
          },
          { k: 'h4', t: 'Samvardhan' },
          {
            k: 'ul',
            items: [
              {
                term: 'Built for agents specifically',
                t: 'A defined-contribution pension scheme created exclusively for LIC of India agents — not offered to the general public.',
              },
              {
                term: 'Its purpose',
                t: 'Introduced by the Competent Authority to help agents accumulate a substantial fund during working years, convertible later into a structured pension.',
              },
              { term: 'Its structure', t: 'A Group Superannuation Cash Accumulation Scheme.' },
              { term: 'Tax treatment', t: 'An unapproved scheme, so it carries no tax benefit.' },
              {
                term: 'Current status',
                t: 'Closed to new enrollment alongside Swavalamban following the launch of APY.',
              },
            ],
          },
        ],
      },
    ],
    bridge:
      'Gratuity and pension pay out at the end. Advances solve the opposite problem — needing capital now, against income you have already proven you can earn.',
  },

  /* ───────────────────────────── 3 — FUND ───────────────────────────── */
  {
    id: 'advances-and-allowances',
    num: '03',
    phase: 'Fund',
    title: 'Advances and Allowances',
    kicker: 'Capital against a book you already hold',
    summary:
      'Nine advances, priced off last year’s renewal commission, for the things that keep the practice running.',
    intro: [
      {
        k: 'p',
        t: 'An agent with a healthy renewal book has a predictable future income and, quite often, no immediate cash. Advances exist to close that gap: LIC lends against the commission you have already demonstrated, for defined purposes, on terms considerably better than a commercial lender would offer.',
      },
      {
        k: 'p',
        t: 'One number governs almost everything here — your renewal commission from the previous financial year. It sets what you can borrow and it caps what can be recovered from you each month.',
      },
    ],
    sections: [
      {
        id: 'advance-conditions',
        title: 'General conditions',
        blocks: [
          {
            k: 'p',
            t: 'These rules apply across the advances in the table below. Read them before the table, because two of them — the recovery ceiling and the misuse penalty — decide whether an advance is a good idea in your particular case.',
          },
          {
            k: 'ul',
            items: [
              {
                term: 'Based on last year’s renewal commission',
                t: 'Advances are granted against the renewal commission earned in the previous financial year.',
              },
              {
                term: 'Fast conveyance advance',
                t: 'Available up to 6 times without interest. The 7th carries 9% per year, paid half-yearly.',
              },
              {
                term: 'Club members',
                t: 'Advances to club members attract 9% interest during any period in which they are not club members.',
              },
              {
                term: 'What can be financed',
                t: 'Four-wheeler, office equipment, computer and training advances, among others.',
              },
              {
                term: 'Who approves',
                t: 'The Senior Divisional Manager (SDM) is the competent authority.',
              },
              {
                term: 'Payment goes to the dealer',
                t: 'Payment is made only in the dealer’s name. A cheque may be sent through the agent with a dealer’s authorization letter.',
              },
              {
                term: 'Recovery ceiling',
                t: 'Monthly repayments across all advances combined must not exceed 60% of your average monthly renewal commission from the previous financial year.',
              },
              {
                term: 'Minimum advance',
                t: '₹7,500 — excluding festival, flood/drought and training advances.',
              },
            ],
          },
          {
            k: 'note',
            tone: 'warn',
            title: 'Use it for what you asked for',
            t: 'An advance not applied to its stated purpose must be repaid within 12 months carrying 18% interest, paid half-yearly — double the standard rate. This is the one condition in the chapter with real teeth.',
          },
        ],
      },
      {
        id: 'advance-table',
        title: 'The nine advances',
        blocks: [
          {
            k: 'p',
            t: 'Amounts are expressed either as a multiple of last year’s renewal commission or as a flat ceiling, whichever the row specifies. Every advance below is priced at 9% per annum.',
          },
          {
            k: 'table',
            head: ['Purpose', 'Amount', 'Repayment', 'Interest'],
            rows: [
              [
                'Hospital medical (self / family)',
                '10% of last year’s renewal commission, or ₹25,000',
                '36 installments',
                '9% p.a.',
              ],
              [
                'Domiciliary medical expense',
                '10% of last year’s renewal commission, or ₹25,000',
                '36 installments',
                '9% p.a.',
              ],
              [
                'Family functions',
                'Last year’s renewal commission, or ₹25,000',
                '36 installments',
                '9% p.a.',
              ],
              ['Marriage (self / family)', '3× last year’s renewal commission', '36 installments', '9% p.a.'],
              [
                'Two-wheeler repairs',
                '₹15,600, or last year’s renewal commission',
                '36 installments',
                '9% p.a.',
              ],
              ['Other housing repair', 'Last year’s renewal commission', '60 installments', '9% p.a.'],
              ['Flood or drought advance', 'Amount fixed by LIC', '36 installments', '9% p.a.'],
              ['Business development', '₹7,500', '12 installments', '9% p.a.'],
              ['Training', 'Last year’s renewal commission', '36 installments', '9% p.a.'],
            ],
          },
          {
            k: 'note',
            tone: 'tip',
            title: 'Housing repair is the outlier',
            t: 'It is the only advance repaid over 60 installments rather than 36 — five years instead of three. At the same 9%, that materially lowers the monthly recovery against your 60% ceiling.',
          },
        ],
      },
    ],
    bridge:
      'Everything so far is available to every agent. The final chapter is the part you qualify for — and it changes the numbers in all three chapters above.',
  },

  /* ───────────────────────────── 4 — CLIMB ──────────────────────────── */
  {
    id: 'club-memberships',
    num: '04',
    phase: 'Climb',
    title: 'Club Memberships',
    kicker: 'Seven tiers, and what each one unlocks',
    summary:
      'The progression ladder — from Distinguished Club to Corporate Club — measured in lives, commission and persistency.',
    intro: [
      {
        k: 'p',
        t: 'LIC’s club programme is the structure that turns individual good years into a recognised standing. Membership is assessed on business performance, client retention and consistency — and crucially, on all three at once. Volume alone does not get you in.',
      },
      {
        k: 'p',
        t: 'The membership year runs 1 September to 31 August. Eligibility is normally judged on the qualifying year plus two of the three preceding financial years, which is the programme’s way of insisting that a single exceptional year is not the same thing as a career.',
      },
      {
        k: 'note',
        tone: 'info',
        title: 'Three numbers repeat at every tier',
        t: 'Net lives insured, first-year commission (FYC) and renewal commission (RC) set the bar. A lapse ratio below 15% across all three years is mandatory at every level — the one condition that cannot be bought with volume.',
      },
    ],
    sections: [
      {
        id: 'club-ladder',
        title: 'The ladder at a glance',
        blocks: [
          {
            k: 'p',
            t: 'Read this table first. Each step roughly doubles what is asked of you at the bottom of the ladder and adds a zero to what you receive at the top of it.',
          },
          {
            k: 'table',
            head: ['Club', 'Net lives', 'FYC', 'RC', 'Office allowance'],
            rows: [
              ['Distinguished', '12', '₹50,000', '₹25,000', '—'],
              ['Branch Manager’s', '15', '₹1,00,000', '₹50,000', '₹5,500 – ₹10,000'],
              ['Divisional Manager’s', '25', '₹2,00,000', '₹1,00,000', '₹20,000 – ₹50,000'],
              ['Zonal Manager’s', '40', '₹3,00,000', '₹2,00,000', '₹50,000 – ₹1,00,000'],
              ['Chairman’s', '60', '₹4,00,000', '₹3,00,000', '₹1,00,000 – ₹1,75,000'],
              ['Galaxy', '80', '₹5,00,000', '₹4,00,000', '₹1,50,000 – ₹2,00,000'],
              ['Corporate', '100', '₹6,00,000', '₹5,00,000', '₹1,75,000 – ₹3,50,000'],
            ],
            foot:
              'FYC and RC figures carry 5% escalation yearly from membership year 2017-18 for new entry. Lapse ratio below 15% in all three years is mandatory throughout.',
          },
        ],
      },
      {
        id: 'distinguished-club',
        title: 'Distinguished Club',
        tier: 1,
        blocks: [
          {
            k: 'p',
            t: 'The entry point, and the one designed for agents still establishing a book. Twelve lives is a realistic first-year target rather than a stretch, and clearing it establishes the habit the rest of the ladder is built on.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 12, mandatory in the qualifying year and the reckoned years.',
              'First-year commission as per chart — ₹50,000 minimum, with 5% escalation yearly from MY 2017-18 for new entry.',
              'Renewal commission as per chart — ₹25,000 minimum, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Basic recognition and motivational support.',
              'Possible small office allowance or promotional items.',
            ],
          },
        ],
      },
      {
        id: 'branch-managers-club',
        title: 'Branch Manager’s Club',
        tier: 2,
        blocks: [
          {
            k: 'p',
            t: 'The first tier that pays a defined office allowance, and the first where condonation appears — meaning a shortfall on one measure can be offset by outperformance on the other. From here, the programme starts funding your practice rather than just acknowledging it.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 15, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹1,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹50,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall, compensated by the same or higher RC percentage increase; up to 100% RC shortfall, compensated by the same or higher FYC percentage increase.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹5,500 – ₹10,000.',
              'Reimbursement for sales promotional gifts.',
              'Basic training access.',
              'Interest-free advances for small purchases.',
            ],
          },
        ],
      },
      {
        id: 'divisional-managers-club',
        title: 'Divisional Manager’s Club',
        tier: 3,
        blocks: [
          {
            k: 'p',
            t: 'A genuine step change. The lives requirement jumps from 15 to 25, but the office allowance moves from four figures to five, and the computer allowance arrives — the point at which the club programme begins covering real operating costs.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 25, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹2,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹1,00,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall compensated by RC; up to 100% RC shortfall compensated by FYC.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹20,000 – ₹50,000.',
              'Interest-free advances for a motorbike or office equipment.',
              'Telephone and mobile bill reimbursement.',
              'Regional training and networking.',
              'Computer allowance: 5% of commission over ₹80,000, capped at ₹3,000.',
            ],
          },
        ],
      },
      {
        id: 'zonal-managers-club',
        title: 'Zonal Manager’s Club',
        tier: 4,
        blocks: [
          {
            k: 'p',
            t: 'Recognition moves beyond the division. Travel to the zonal convention is covered, a car advance replaces the motorbike, and Moral Hazard Report authority arrives — a mark of professional trust rather than a cash benefit.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 40, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹3,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹2,00,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall compensated by RC; up to 100% RC shortfall compensated by FYC.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹50,000 – ₹1,00,000.',
              'Interest-free advances for a car or motorbike.',
              'Computer allowance: 5% of commission over ₹1,30,000, capped at ₹5,000.',
              'Zonal convention attendance with travel covered.',
              'Guest house access at concessional rates.',
              'Moral Hazard Report (MHR) authority.',
            ],
          },
        ],
      },
      {
        id: 'chairmans-club',
        title: 'Chairman’s Club',
        tier: 5,
        blocks: [
          {
            k: 'p',
            t: 'The tier most agents name when asked what they are working toward. Car advances reach ₹5 lakh, international incentives appear, and life membership becomes possible — after 15 years, or at age 60 with 25 years of service.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 60, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹4,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹3,00,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall compensated by RC; up to 100% RC shortfall compensated by FYC.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹1,00,000 – ₹1,75,000.',
              'Interest-free car advances up to ₹5 lakh.',
              'Computer allowance: 5% of commission over ₹1,85,000, capped at ₹10,000.',
              'Annual convention with travel and accommodation.',
              'International trip incentives for top performers.',
              'MHR authority and certificate.',
              'Extra allowance of 5% – 30% where the lapse rate is below 10%.',
            ],
          },
          {
            k: 'note',
            tone: 'tip',
            title: 'The persistency bonus compounds here',
            t: 'Holding lapse below 10% — not merely the mandatory 15% — adds 5% to 30% on top. At this tier that premium is worth more than a full step up the ladder was at the bottom of it.',
          },
        ],
      },
      {
        id: 'galaxy-club',
        title: 'Galaxy Club',
        tier: 6,
        blocks: [
          {
            k: 'p',
            t: 'Eighty lives and half a million in first-year commission. The benefits shift in character at this point — from allowances that cover costs to access that cannot be bought, including training alongside the country’s top agents.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 80, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹5,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹4,00,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall compensated by RC; up to 100% RC shortfall compensated by FYC.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹1,50,000 – ₹2,00,000.',
              'Enhanced car or office advances.',
              'Computer allowance and international travel rewards.',
              'Exclusive training with top agents.',
              'MHR authority and recognition.',
            ],
          },
        ],
      },
      {
        id: 'corporate-club',
        title: 'Corporate Club',
        tier: 7,
        blocks: [
          {
            k: 'p',
            t: 'The top of the ladder: 100 net lives, ₹6,00,000 in first-year commission, and an office allowance that runs to ₹3.5 lakh. Housing loans join the advance list, MDRT eligibility comes into view, and the recognition becomes global rather than national.',
          },
          { k: 'h4', t: 'Eligibility' },
          {
            k: 'ul',
            items: [
              'Minimum net lives: 100, mandatory in the qualifying year and the reckoned years.',
              'FYC: ₹6,00,000, with 5% escalation from MY 2017-18.',
              'RC: ₹5,00,000, with 5% escalation.',
              'Lapse ratio below 15% in all three years.',
              'Assessed on the qualifying year and 2 of the 3 preceding financial years.',
              'Condonation: up to 50% FYC shortfall compensated by RC; up to 100% RC shortfall compensated by FYC.',
            ],
          },
          { k: 'h4', t: 'What you receive' },
          {
            k: 'ul',
            items: [
              'Office allowance of ₹1,75,000 – ₹3,50,000.',
              'Interest-free advances for car, office and housing loans.',
              'International trips and luxury incentives.',
              'Advanced training and leadership roles.',
              'MHR authority, certificate, and global recognition including MDRT eligibility.',
              'Extra allowance of 5% – 30% where the lapse rate is below 10%.',
            ],
          },
          {
            k: 'note',
            tone: 'info',
            title: 'Life membership',
            t: 'At both Chairman’s and Corporate level, membership can become permanent — after 15 to 25 years, or at age 60 with 25 years of service. The standing outlasts the qualifying.',
          },
        ],
      },
    ],
    bridge: null,
  },
];

export const CLOSING = {
  title: 'One number runs through all four chapters',
  body:
    'Renewal commission decides what you earn in chapter one, what your gratuity and term cover are worth in chapter two, how much you can borrow in chapter three, and which club you qualify for in chapter four. Everything in this handbook is downstream of policies staying alive — which is why the work that matters most is the work after the sale.',
};
