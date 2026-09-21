import { useState } from 'react'
import Avatar from '../components/atoms/Avatar.jsx'
import Badge from '../components/atoms/Badge.jsx'
import Button from '../components/atoms/Button.jsx'
import Pill from '../components/atoms/Pill.jsx'
import DecisionToggle, { THREE_OPTIONS } from '../components/molecules/DecisionToggle.jsx'
import FormField from '../components/molecules/FormField.jsx'
import SubscriptionRow from '../components/molecules/SubscriptionRow.jsx'
import SummaryCard from '../components/molecules/SummaryCard.jsx'
import AuthCard from '../components/organisms/AuthCard.jsx'
import Footer from '../components/organisms/Footer.jsx'
import Header from '../components/organisms/Header.jsx'
import { isoDateFromToday } from '../utils/dates.js'
import styles from './StyleguidePage.module.css'

// Every component from the design system (document 3) on one page, so I can
// check them against the PDF, at phone and desktop widths.
// Only routed in development (see App.jsx): it never ships to the live site.

const COLOURS = [
  'primary', 'accent', 'bg', 'surface', 'text', 'text-muted', 'border', 'divider',
]

const SAMPLE_USER = { name: 'Name', email: 'name@email.com' }

const SAMPLE_ROWS = [
  { id: 1, name: 'Streaming+', price: 15.99, endDate: isoDateFromToday(1), status: 'undecided' },
  { id: 2, name: 'Music Pro', price: 10.99, endDate: isoDateFromToday(2), status: 'cancel' },
  { id: 3, name: 'Cloud Drive', price: 2.99, endDate: isoDateFromToday(6), status: 'keep' },
  { id: 4, name: 'Design App', price: 12, endDate: isoDateFromToday(19), status: 'undecided' },
  { id: 5, name: 'Old Trial', price: 4.99, endDate: isoDateFromToday(-3), status: 'cancel' },
]

const FILTERS = ['All', 'Ending soon', 'Keep', 'Cancel', 'Undecided']

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>
      {children}
    </section>
  )
}

export default function StyleguidePage() {
  const [filter, setFilter] = useState('All')
  const [twoWay, setTwoWay] = useState('cancel')
  const [threeWay, setThreeWay] = useState('undecided')
  const [rows, setRows] = useState(SAMPLE_ROWS)

  function changeDecision(id, status) {
    setRows(rows.map((row) => (row.id === id ? { ...row, status } : row)))
  }

  return (
    <>
      <Header user={SAMPLE_USER} onLogout={() => alert('Log out clicked')}>
        <Button>+ Add subscription</Button>
      </Header>

      <main className={styles.page}>
        <h1 className={styles.title}>SubAlert styleguide</h1>
        <p className={styles.note}>Development only. Resize the window below 640px to see the phone layout.</p>

        <Section title="Colour tokens">
          <div className={styles.swatches}>
            {COLOURS.map((name) => (
              <div key={name} className={styles.swatch}>
                <span className={styles.chip} style={{ background: `var(--color-${name})` }} />
                <code>--color-{name}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type scale">
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Heading 24px: Add subscription</p>
          <p style={{ fontSize: 'var(--font-size-md)' }}>Body 16px: Streaming+ ends tomorrow. Decide before you're charged.</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Small 13px: Subscription end date</p>
        </Section>

        <Section title="Button">
          <div className={styles.rowOfThings}>
            <Button>Save</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="danger">Delete subscription</Button>
            <Button disabled>Saving…</Button>
          </div>
        </Section>

        <Section title="FormField">
          <div className={styles.fields}>
            <FormField id="sg-email" label="Email" type="email" placeholder="name@email.com" />
            <FormField id="sg-name" label="Service name" error="Enter a service name" />
          </div>
        </Section>

        <Section title="DecisionToggle">
          <div className={styles.toggles}>
            <DecisionToggle value={twoWay} onChange={setTwoWay} label="Two options" />
            <DecisionToggle value={threeWay} onChange={setThreeWay} options={THREE_OPTIONS} label="Three options" />
          </div>
        </Section>

        <Section title="Badge, Avatar and Pill">
          <div className={styles.rowOfThings}>
            <Badge level="urgent">Urgent</Badge>
            <Badge level="soon">Soon</Badge>
            <Badge level="later">19 days</Badge>
            <Avatar name="Name" />
            <Avatar name="Streaming+" variant="neutral" />
          </div>
          <div className={styles.pills}>
            {FILTERS.map((label) => (
              <Pill key={label} selected={filter === label} onClick={() => setFilter(label)}>
                {label}
              </Pill>
            ))}
          </div>
        </Section>

        <Section title="SummaryCard">
          <div className={styles.summary}>
            <SummaryCard label="Ending in 48h" value="2" />
            <SummaryCard label="Active" value="6" />
            <SummaryCard label="Saved by cancelling" value="$38/mo" />
          </div>
        </Section>

        <Section title="SubscriptionRow">
          <div className={styles.list}>
            {rows.map((row) => (
              <SubscriptionRow
                key={row.id}
                subscription={row}
                onDecisionChange={changeDecision}
                onEdit={(id) => alert(`Edit ${id}`)}
                onDelete={(id) => alert(`Delete ${id}`)}
              />
            ))}
          </div>
        </Section>

        <Section title="Header (auth variant)">
          <Header variant="auth" />
        </Section>

        <Section title="AuthCard">
          <div className={styles.authStage}>
            <AuthCard
              title="Log in"
              subtitle="Track your subscriptions before they bill you."
              footer={<>Don&apos;t have an account? <a href="#register">Register</a></>}
            >
              <div className={styles.stack}>
                <FormField id="sg-login-email" label="Email" type="email" placeholder="name@email.com" />
                <FormField id="sg-login-password" label="Password" type="password" error="Wrong email or password" />
                <Button fullWidth>Log in</Button>
              </div>
            </AuthCard>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  )
}
