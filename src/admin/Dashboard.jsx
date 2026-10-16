import { Link } from 'react-router-dom'
import { motion } from '../lib/motion.jsx'
import { ArrowRight, CheckCircle2, Hourglass, ImagePlus, Inbox, Wallet } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp.js'
import { StatusBadge, EmptyState } from '../components/ui.jsx'
import { timeAgo, toDate } from '../lib/format.js'

function Stat({ Icon, label, value, prefix = '', tone, to, i }) {
  const n = useCountUp(value)
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 240, damping: 22 }}>
      <Link to={to} className="stat card press" style={{ '--tone': tone }}>
        <span className="stat-icon">
          <Icon size={20} />
        </span>
        <strong>
          {prefix}
          {n.toLocaleString()}
        </strong>
        <small>{label}</small>
      </Link>
    </motion.div>
  )
}

export default function Dashboard({ orders }) {
  const now = new Date()
  const monthIncome = orders
    .filter((o) => {
      const d = toDate(o.paidAt)
      return o.paid && d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0)

  const count = (s) => orders.filter((o) => o.status === s).length
  const unpaid = orders.filter((o) => o.status === 'delivered' && !o.paid).length
  const hour = now.getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{hello}</h1>
          <p>Here is what is happening at Shan Graphix.</p>
        </div>
      </header>

      <div className="stats">
        <Stat i={0} Icon={Inbox} label="New requests" value={count('new')} tone="#B90D0D" to="/admin/orders" />
        <Stat i={1} Icon={Hourglass} label="In progress" value={count('progress')} tone="#D98A00" to="/admin/orders" />
        <Stat i={2} Icon={CheckCircle2} label="Delivered, unpaid" value={unpaid} tone="#2F6FE4" to="/admin/orders" />
        <Stat i={3} Icon={Wallet} label="Paid this month" value={monthIncome} prefix="Rs. " tone="#1F9D55" to="/admin/orders" />
      </div>

      <Link to="/admin/works" className="add-work card press">
        <span className="tile-icon">
          <ImagePlus size={22} />
        </span>
        <span>
          <strong>Add new work</strong>
          <small>Drag and drop images to your portfolio</small>
        </span>
        <ArrowRight size={20} />
      </Link>

      <section className="block">
        <div className="block-head">
          <h2>Recent orders</h2>
          <Link to="/admin/orders" className="link">
            See all <ArrowRight size={16} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon={Inbox} title="No orders yet" text="New requests from your website will appear here." />
        ) : (
          <div className="stack">
            {orders.slice(0, 5).map((o) => (
              <Link key={o.id} to="/admin/orders" className="row card press">
                <span className="avatar">{(o.name || '?')[0].toUpperCase()}</span>
                <span className="row-main">
                  <strong>{o.name}</strong>
                  <small>
                    {o.service} · {timeAgo(o.createdAt)}
                  </small>
                </span>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
