import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Activity, ArrowDown, ArrowLeft, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, CreditCard, Dumbbell,
  FileBarChart2, Flame, LayoutDashboard, Menu, MoreHorizontal,
  Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp,
  UserRound, Users, Wallet, X, Zap,
} from 'lucide-react'

type Gender = 'Male' | 'Female' | 'Other'
type PaymentMethod = 'Debit/Credit Card' | 'Cash' | 'Bank Transfer' | 'UPI'
type Page = 'Dashboard' | 'Members' | 'Memberships' | 'Payments' | 'Reports' | 'Settings'
type Duration = '1 month' | '2 months' | '5 months' | 'Custom'
type MemberStatus = 'Active' | 'Expiring soon' | 'Expired' | 'On break' | 'Inactive'

type Membership = {
  id: string
  duration: Duration
  durationDays: number
  purchaseDate: string
  startDate: string
  expiryDate: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  reference: string
  isActive: boolean
}

type BreakPeriod = { startDate: string; endDate: string; reason: string; endedEarly?: boolean }
type Member = {
  id: string
  name: string
  gender: Gender
  dob: string
  bloodGroup: string
  weight: number
  phone: string
  email: string
  address: string
  registrationDate: string
  avatar: string
  memberships: Membership[]
  breaks: BreakPeriod[]
  statusHistory: { status: string; date: string; note: string }[]
}
type Payment = {
  id: string
  memberId: string
  membershipId: string
  amount: number
  date: string
  method: PaymentMethod
  reference: string
}
type Notice = { id: string; title: string; detail: string; date: string; kind: 'warning' | 'success' | 'danger' | 'info'; read: boolean }

const today = new Date()
const isoDate = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
const shiftDate = (days: number, base = today) => {
  const date = new Date(base)
  date.setDate(date.getDate() + days)
  return isoDate(date)
}
const parseDate = (value: string) => new Date(`${value}T12:00:00`)
const dateDiff = (later: string, earlier: string) =>
  Math.floor((parseDate(later).getTime() - parseDate(earlier).getTime()) / 86400000)
const addDays = (date: string, amount: number) => {
  const result = parseDate(date)
  result.setDate(result.getDate() + amount)
  return isoDate(result)
}
const formatDate = (value: string) =>
  parseDate(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const durationLengths: Record<Exclude<Duration, 'Custom'>, number> = {
  '1 month': 30, '2 months': 60, '5 months': 150,
}
const avatar = (id: number) => `https://images.unsplash.com/photo-${[
  '1534528741775-53994a69daeb',
  '1500648767791-00dcc994a43e',
  '1531123897727-8f129e1688ce',
  '1506794778202-cad84cf45f1d',
  '1544005313-94ddf0286df2',
  '1507003211169-0a1dd7228f2d',
  '1508214751196-bcfd4ca60f91',
  '1504593811423-6dd665756598',
][id % 8]}?auto=format&fit=crop&w=160&h=160&q=80`

function makeMembership(id: string, startOffset: number, duration: Duration, amount: number, active = true): Membership {
  const startDate = shiftDate(startOffset)
  const durationDays = duration === 'Custom' ? 45 : durationLengths[duration]
  return {
    id: `mem-${id}`, duration, durationDays, purchaseDate: shiftDate(startOffset - 2),
    startDate, expiryDate: addDays(startDate, durationDays), amount,
    paymentDate: shiftDate(startOffset - 2), paymentMethod: ['Debit/Credit Card', 'UPI', 'Cash', 'Bank Transfer'][Number(id) % 4] as PaymentMethod,
    reference: `SKF-${String(4812 + Number(id) * 17).padStart(6, '0')}`, isActive: active,
  }
}

function createSeedData() {
  const people: Omit<Member, 'memberships' | 'breaks' | 'statusHistory'>[] = [
    { id: '1', name: 'Priya Sharma', gender: 'Female', dob: '1996-03-14', bloodGroup: 'O+', weight: 59, phone: '+91 98765 43210', email: 'priya.sharma@example.in', address: 'Flat 12, Koregaon Park, Pune, Maharashtra', registrationDate: shiftDate(-2), avatar: avatar(0) },
    { id: '2', name: 'Rahul Verma', gender: 'Male', dob: '1993-08-22', bloodGroup: 'A+', weight: 78, phone: '+91 98765 43211', email: 'rahul.verma@example.in', address: 'B-604, Baner Road, Pune, Maharashtra', registrationDate: shiftDate(-4), avatar: avatar(1) },
    { id: '3', name: 'Sneha Patel', gender: 'Female', dob: '1998-11-02', bloodGroup: 'B+', weight: 62, phone: '+91 98765 43212', email: 'sneha.patel@example.in', address: '24, Prabhat Road, Deccan, Pune, Maharashtra', registrationDate: shiftDate(-7), avatar: avatar(2) },
    { id: '4', name: 'Arjun Singh', gender: 'Male', dob: '1995-06-09', bloodGroup: 'AB+', weight: 72, phone: '+91 98765 43213', email: 'arjun.singh@example.in', address: 'A-302, Wakad, Pune, Maharashtra', registrationDate: shiftDate(-13), avatar: avatar(3) },
    { id: '5', name: 'Neha Gupta', gender: 'Female', dob: '1992-01-28', bloodGroup: 'O-', weight: 64, phone: '+91 98765 43214', email: 'neha.gupta@example.in', address: '18, Kothrud, Pune, Maharashtra', registrationDate: shiftDate(-18), avatar: avatar(4) },
    { id: '6', name: 'Rohit Yadav', gender: 'Male', dob: '1989-10-17', bloodGroup: 'A-', weight: 84, phone: '+91 98765 43215', email: 'rohit.yadav@example.in', address: 'C-110, Hadapsar, Pune, Maharashtra', registrationDate: shiftDate(-24), avatar: avatar(5) },
    { id: '7', name: 'Pooja Mehta', gender: 'Female', dob: '1999-04-03', bloodGroup: 'B-', weight: 57, phone: '+91 98765 43216', email: 'pooja.mehta@example.in', address: '7, Aundh, Pune, Maharashtra', registrationDate: shiftDate(-35), avatar: avatar(6) },
    { id: '8', name: 'Ankit Joshi', gender: 'Male', dob: '1991-12-12', bloodGroup: 'O+', weight: 81, phone: '+91 98765 43217', email: 'ankit.joshi@example.in', address: '22, Viman Nagar, Pune, Maharashtra', registrationDate: shiftDate(-42), avatar: avatar(7) },
  ]
  const membershipSpecs: [number, Duration, number, boolean][] = [
    [-5, '2 months', 1499, true], [-18, '5 months', 3899, true], [-28, '1 month', 899, true],
    [-25, '1 month', 899, true], [-51, '1 month', 899, true], [-8, '2 months', 1499, false],
    [-35, '5 months', 3899, true], [-100, '2 months', 1499, true],
  ]
  const members = people.map((person, index): Member => {
    const current = makeMembership(person.id, ...membershipSpecs[index])
    const previousStart = addDays(current.startDate, -(current.durationDays + 4))
    const previous: Membership = {
      ...current,
      id: `mem-${person.id}-previous`,
      startDate: previousStart,
      purchaseDate: addDays(previousStart, -2),
      expiryDate: addDays(previousStart, current.durationDays),
      paymentDate: addDays(previousStart, -2),
      reference: `SKF-HIST-${String(1200 + index * 83)}`,
      isActive: false,
    }
    return {
      ...person,
      memberships: [current, previous],
      breaks: index === 2 ? [{ startDate: shiftDate(-2), endDate: shiftDate(4), reason: 'Travel & recovery' }] : [],
      statusHistory: [{ status: index === 5 ? 'Inactive' : 'Active', date: person.registrationDate, note: 'Member registered' }],
    }
  })
  const payments = members.flatMap((member): Payment[] => member.memberships.map((membership): Payment => ({
    id: `pay-${membership.id}`,
    memberId: member.id,
    membershipId: membership.id,
    amount: membership.amount,
    date: membership.paymentDate,
    method: membership.paymentMethod,
    reference: membership.reference,
  })))
  return { members, payments }
}

function statusOf(member: Member): MemberStatus {
  const current = member.memberships[0]
  if (!current) return 'Inactive'
  const todayString = isoDate(today)
  const activeBreak = member.breaks.find((period) => !period.endedEarly && period.startDate <= todayString && period.endDate >= todayString)
  if (activeBreak) return 'On break'
  if (!current.isActive) return 'Inactive'
  const remaining = daysRemaining(member)
  if (remaining < 0) return 'Expired'
  if (remaining <= 7) return 'Expiring soon'
  return 'Active'
}

function effectiveExpiry(member: Member) {
  const current = member.memberships[0]
  if (!current) return ''
  const todayString = isoDate(today)
  let extension = 0
  member.breaks.forEach((period) => {
    const start = parseDate(period.startDate).getTime()
    const end = parseDate(period.endDate).getTime()
    const now = parseDate(todayString).getTime()
    const elapsedEnd = Math.min(end, now - 86400000)
    if (start <= elapsedEnd) extension += Math.floor((elapsedEnd - start) / 86400000) + 1
  })
  return addDays(current.expiryDate, extension)
}

function daysRemaining(member: Member) {
  const expiry = effectiveExpiry(member)
  return expiry ? dateDiff(expiry, isoDate(today)) : 0
}

const initialNotices: Notice[] = [
  { id: 'n1', title: 'Membership expires in 5 days', detail: 'Arjun Singh · Standard monthly', date: shiftDate(0), kind: 'warning', read: false },
  { id: 'n2', title: 'Membership expired', detail: 'Neha Gupta · Renewal needed', date: shiftDate(-1), kind: 'danger', read: false },
  { id: 'n3', title: 'Membership renewed', detail: 'Rahul Verma · 5 months added', date: shiftDate(-1), kind: 'success', read: true },
  { id: 'n4', title: 'Member placed on break', detail: 'Sneha Patel · Ends in 4 days', date: shiftDate(-2), kind: 'info', read: true },
]

function App() {
  const initial = useMemo(createSeedData, [])
  const [members, setMembers] = useState<Member[]>(initial.members)
  const [payments, setPayments] = useState<Payment[]>(initial.payments)
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [page, setPage] = useState<Page>('Dashboard')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [modal, setModal] = useState<'member' | 'renew' | 'break' | 'payment' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('All genders')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [durationFilter, setDurationFilter] = useState('All durations')
  const [expiryFilter, setExpiryFilter] = useState('Any expiry')
  const [daysFilter, setDaysFilter] = useState('Any days remaining')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const pushNotice = (title: string, detail: string, kind: Notice['kind']) => {
    setNotices((all) => [{ id: `n-${Date.now()}`, title, detail, date: isoDate(today), kind, read: false }, ...all])
  }
  const updateMember = (updated: Member) => setMembers((all) => all.map((member) => member.id === updated.id ? updated : member))
  const activeProfile = members.find((member) => member.id === profileId) ?? null
  const unreadCount = notices.filter((notice) => !notice.read).length

  const filteredMembers = useMemo(() => members.filter((member) => {
    const current = member.memberships[0]
    const status = statusOf(member)
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [member.name, member.email, member.phone].some((item) => item.toLowerCase().includes(query))
    const matchesGender = genderFilter === 'All genders' || member.gender === genderFilter
    const matchesStatus = statusFilter === 'All statuses' || status === statusFilter
    const matchesDuration = durationFilter === 'All durations' || current?.duration === durationFilter
    const days = daysRemaining(member)
    const matchesDays = daysFilter === 'Any days remaining'
      || (daysFilter === '0–7 days' && days >= 0 && days <= 7)
      || (daysFilter === '8–30 days' && days >= 8 && days <= 30)
      || (daysFilter === 'Expired' && days < 0)
    const matchesExpiry = expiryFilter === 'Any expiry'
      || (expiryFilter === 'Next 7 days' && days >= 0 && days <= 7)
      || (expiryFilter === 'Next 30 days' && days >= 0 && days <= 30)
      || (expiryFilter === 'Already expired' && days < 0)
    return matchesSearch && matchesGender && matchesStatus && matchesDuration && matchesDays && matchesExpiry
  }).sort((a, b) => {
    const left = sortBy === 'days' ? daysRemaining(a) : sortBy === 'expiry' ? effectiveExpiry(a) : sortBy === 'name' ? a.name.toLowerCase() : a.registrationDate
    const right = sortBy === 'days' ? daysRemaining(b) : sortBy === 'expiry' ? effectiveExpiry(b) : sortBy === 'name' ? b.name.toLowerCase() : b.registrationDate
    const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
    return sortDirection === 'asc' ? comparison : -comparison
  }), [members, search, genderFilter, statusFilter, durationFilter, expiryFilter, daysFilter, sortBy, sortDirection])

  const dashboard = useMemo(() => {
    const statuses = members.map(statusOf)
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const monthPayments = payments.filter((payment) => payment.date.slice(0, 7) === isoDate(today).slice(0, 7))
    return {
      total: members.length,
      active: statuses.filter((status) => status === 'Active').length,
      inactive: statuses.filter((status) => status === 'Inactive').length,
      expired: statuses.filter((status) => status === 'Expired').length,
      expiring: statuses.filter((status) => status === 'Expiring soon').length,
      breaks: statuses.filter((status) => status === 'On break').length,
      memberships: members.reduce((sum, member) => sum + member.memberships.length, 0),
      revenue: totalRevenue,
      monthlyRevenue: monthPayments.reduce((sum, payment) => sum + payment.amount, 0),
    }
  }, [members, payments])

  const openMemberForm = (member?: Member) => {
    setEditingId(member?.id ?? null)
    setModal('member')
  }
  const handleMemberSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fields = {
      name: String(form.get('name')).trim(), gender: String(form.get('gender')) as Gender,
      dob: String(form.get('dob')), bloodGroup: String(form.get('bloodGroup')),
      weight: Number(form.get('weight')) || 0, phone: String(form.get('phone')),
      email: String(form.get('email')), address: String(form.get('address')),
      registrationDate: String(form.get('registrationDate')),
    }
    const previous = members.find((member) => member.id === editingId)
    if (previous) {
      updateMember({ ...previous, ...fields })
      notify('Member profile updated')
    } else {
      const id = String(Date.now())
      const avatarFile = form.get('photo') as File | null
      const photoUrl = avatarFile?.size ? URL.createObjectURL(avatarFile) : avatar(members.length)
      const duration = String(form.get('duration')) as Duration
      const startDate = String(form.get('startDate'))
      const days = duration === 'Custom' ? Number(form.get('customDays')) || 30 : durationLengths[duration as Exclude<Duration, 'Custom'>]
      const membership: Membership = {
        id: `mem-${id}`, duration, durationDays: days, purchaseDate: String(form.get('purchaseDate')),
        startDate, expiryDate: addDays(startDate, days), amount: Number(form.get('amount')) || 0,
        paymentDate: String(form.get('paymentDate')), paymentMethod: String(form.get('paymentMethod')) as PaymentMethod,
        reference: String(form.get('reference')) || `SKF-${id.slice(-6)}`, isActive: true,
      }
      const member: Member = {
        id, ...fields, avatar: photoUrl, memberships: [membership], breaks: [],
        statusHistory: [{ status: 'Active', date: fields.registrationDate, note: 'Member registered' }],
      }
      setMembers((all) => [member, ...all])
      setPayments((all) => [{ id: `pay-${id}`, memberId: id, membershipId: membership.id, amount: membership.amount, date: membership.paymentDate, method: membership.paymentMethod, reference: membership.reference }, ...all])
      pushNotice('New member registered', `${member.name} joined SK FITNESS`, 'success')
      notify('Member added successfully')
    }
    setModal(null)
  }
  const handleRenew = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeProfile) return
    const form = new FormData(event.currentTarget)
    const duration = String(form.get('duration')) as Duration
    const startDate = String(form.get('startDate'))
    const durationDays = duration === 'Custom' ? Number(form.get('customDays')) || 30 : durationLengths[duration as Exclude<Duration, 'Custom'>]
    const membership: Membership = {
      id: `mem-${Date.now()}`, duration, durationDays, purchaseDate: isoDate(today),
      startDate, expiryDate: addDays(startDate, durationDays), amount: Number(form.get('amount')) || 0,
      paymentDate: String(form.get('paymentDate')), paymentMethod: String(form.get('paymentMethod')) as PaymentMethod,
      reference: String(form.get('reference')), isActive: true,
    }
    updateMember({
      ...activeProfile,
      memberships: [membership, ...activeProfile.memberships.map((item, index) => index === 0 ? { ...item, isActive: false } : item)],
      statusHistory: [{ status: 'Active', date: isoDate(today), note: `Membership renewed · ${duration}` }, ...activeProfile.statusHistory],
    })
    setPayments((all) => [{ id: `pay-${membership.id}`, memberId: activeProfile.id, membershipId: membership.id, amount: membership.amount, date: membership.paymentDate, method: membership.paymentMethod, reference: membership.reference }, ...all])
    pushNotice('Membership renewed', `${activeProfile.name} · ${duration} added`, 'success')
    notify('Membership renewed successfully')
    setModal(null)
  }
  const handleBreak = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeProfile) return
    const form = new FormData(event.currentTarget)
    const period = { startDate: String(form.get('startDate')), endDate: String(form.get('endDate')), reason: String(form.get('reason')) }
    if (period.endDate < period.startDate) {
      notify('End date must be after the start date')
      return
    }
    if (activeProfile.breaks.some((existing) => !existing.endedEarly && period.startDate <= existing.endDate && period.endDate >= existing.startDate)) {
      notify('This break overlaps an existing membership break')
      return
    }
    updateMember({ ...activeProfile, breaks: [period, ...activeProfile.breaks], statusHistory: [{ status: 'On break', date: period.startDate, note: period.reason }, ...activeProfile.statusHistory] })
    pushNotice('Member placed on break', `${activeProfile.name} · ${period.reason}`, 'info')
    notify('Membership break scheduled')
    setModal(null)
  }
  const endBreak = (member: Member) => {
    const currentBreak = member.breaks.find((period) => !period.endedEarly && period.startDate <= isoDate(today) && period.endDate >= isoDate(today))
    if (!currentBreak) return
    if (!window.confirm(`End ${member.name}'s membership break today?`)) return
    updateMember({
      ...member,
      breaks: member.breaks.map((period) => period === currentBreak ? { ...period, endDate: isoDate(today), endedEarly: true } : period),
      statusHistory: [{ status: 'Active', date: isoDate(today), note: 'Membership break ended' }, ...member.statusHistory],
    })
    notify('Break ended and membership time restored')
  }
  const handlePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const member = members.find((item) => item.id === String(form.get('memberId')))
    const membership = member?.memberships[0]
    if (!member || !membership) return
    const payment: Payment = {
      id: `pay-${Date.now()}`, memberId: member.id, membershipId: membership.id,
      amount: Number(form.get('amount')) || 0, date: String(form.get('date')),
      method: String(form.get('method')) as PaymentMethod, reference: String(form.get('reference')),
    }
    setPayments((all) => [payment, ...all])
    pushNotice('Payment received', `${member.name} · ${money(payment.amount)}`, 'success')
    notify('Payment recorded successfully')
    setModal(null)
  }
  const navigate = (next: Page) => {
    setPage(next)
    setMobileNavOpen(false)
    setProfileId(null)
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} memberCount={members.length} onNavigate={navigate} mobileOpen={mobileNavOpen} closeMobile={() => setMobileNavOpen(false)} />
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="today-label"><CalendarDays size={15} />{formatDate(isoDate(today))}</div>
            <div className="notification-wrap">
              <button className={`icon-button notification-button ${noticeOpen ? 'selected' : ''}`} onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifications">
                <Bell size={18} />{unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
              </button>
              {noticeOpen && <NotificationPanel notices={notices} onRead={() => setNotices((all) => all.map((notice) => ({ ...notice, read: true })))} onClose={() => setNoticeOpen(false)} />}
            </div>
            <div className="header-divider" />
            <div className="admin-profile"><div className="admin-avatar">AK</div><div className="admin-copy"><strong>Amit Kumar</strong><span>Studio manager</span></div><ChevronDown size={14} /></div>
          </div>
        </header>

        <main className="page-content">
          {page === 'Dashboard' && <DashboardPage members={members} dashboard={dashboard} onNavigate={navigate} onProfile={setProfileId} />}
          {page === 'Members' && <MembersPage members={filteredMembers} allCount={members.length} search={search} setSearch={setSearch} gender={genderFilter} setGender={setGenderFilter} status={statusFilter} setStatus={setStatusFilter} duration={durationFilter} setDuration={setDurationFilter} expiry={expiryFilter} setExpiry={setExpiryFilter} daysFilter={daysFilter} setDaysFilter={setDaysFilter} sortBy={sortBy} setSortBy={setSortBy} sortDirection={sortDirection} setSortDirection={setSortDirection} onAdd={() => openMemberForm()} onEdit={openMemberForm} onProfile={setProfileId} />}
          {page === 'Memberships' && <MembershipsPage members={members} onProfile={setProfileId} onRenew={(member) => { setProfileId(member.id); setModal('renew') }} />}
          {page === 'Payments' && <PaymentsPage members={members} payments={payments} onAdd={() => setModal('payment')} />}
          {page === 'Reports' && <ReportsPage members={members} payments={payments} />}
          {page === 'Settings' && <SettingsPage notify={notify} />}
        </main>
      </div>

      {activeProfile && <MemberProfile member={activeProfile} payments={payments.filter((payment) => payment.memberId === activeProfile.id)} onClose={() => setProfileId(null)} onEdit={() => openMemberForm(activeProfile)} onRenew={() => setModal('renew')} onBreak={() => setModal('break')} onEndBreak={() => endBreak(activeProfile)} />}
      {modal === 'member' && <MemberFormModal member={members.find((item) => item.id === editingId) ?? null} onClose={() => setModal(null)} onSubmit={handleMemberSubmit} />}
      {modal === 'renew' && activeProfile && <RenewModal member={activeProfile} onClose={() => setModal(null)} onSubmit={handleRenew} />}
      {modal === 'break' && activeProfile && <BreakModal member={activeProfile} onClose={() => setModal(null)} onSubmit={handleBreak} />}
      {modal === 'payment' && <PaymentModal members={members} onClose={() => setModal(null)} onSubmit={handlePayment} />}
      {toast && <div className="toast"><span className="toast-check"><Check size={15} /></span>{toast}</div>}
    </div>
  )
}

export default App

function Sidebar({ page, memberCount, onNavigate, mobileOpen, closeMobile }: { page: Page; memberCount: number; onNavigate: (page: Page) => void; mobileOpen: boolean; closeMobile: () => void }) {
  const groups: { label: string; items: { name: Page; icon: typeof LayoutDashboard; badge?: string }[] }[] = [
    { label: 'WORKSPACE', items: [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'Members', icon: Users, badge: String(memberCount).padStart(2, '0') }, { name: 'Memberships', icon: ShieldCheck }] },
  ]
  return <>
    {mobileOpen && <button className="mobile-scrim" onClick={closeMobile} aria-label="Close navigation" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-symbol"><Dumbbell size={20} strokeWidth={2.4} /></div>
        <div className="brand-text"><strong>SK FITNESS</strong><small>Fitness Club &amp; Gym Management</small></div>
        <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={closeMobile}><X size={18} /></button>
      </div>
      <div className="club-switcher"><div className="club-mark">S</div><div><strong>SK FITNESS</strong><span>Pune, Maharashtra, India</span></div><ChevronDown size={15} /></div>
      <nav className="sidebar-nav">
        {groups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>
          {group.items.map(({ name, icon: Icon, badge }) => <button key={name} onClick={() => onNavigate(name)} className={`nav-item ${page === name ? 'nav-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{name}</span>{badge && <span className="nav-badge">{badge}</span>}</button>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={16} /></div><strong>Make your club stronger</strong><p>Explore the latest features and take your gym to the next level.</p><button onClick={() => onNavigate('Reports')}>Explore features <ArrowUpRight size={14} /></button></div>
        <div className="sidebar-help"><div className="help-avatar">?</div><div><strong>Need a hand?</strong><span>Visit our help center</span></div><ArrowUpRight size={14} /></div>
        <div className="sidebar-footer"><span>SK FITNESS v1.0.4</span><span className="online-dot" />All systems operational</div>
      </div>
    </aside>
  </>
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>
}

function DashboardPage({ members, dashboard, onNavigate, onProfile }: { members: Member[]; dashboard: ReturnType<typeof useDashboardType>; onNavigate: (page: Page) => void; onProfile: (id: string) => void }) {
  const recentMembers = [...members].sort((a, b) => b.registrationDate.localeCompare(a.registrationDate)).slice(0, 4)
  const expiring = members.filter((member) => daysRemaining(member) >= 0 && daysRemaining(member) <= 14).sort((a, b) => daysRemaining(a) - daysRemaining(b)).slice(0, 4)
  const stats = [
    { label: 'Total members', value: dashboard.total, icon: Users, iconClass: 'stat-lime', trend: '+12.8%', note: 'vs. last month', tone: 'positive' },
    { label: 'Active members', value: dashboard.active, icon: Activity, iconClass: 'stat-blue', trend: '+8.2%', note: 'vs. last month', tone: 'positive' },
    { label: 'Expiring soon', value: dashboard.expiring, icon: Clock3, iconClass: 'stat-amber', trend: 'Next 7 days', note: 'Needs attention', tone: 'neutral' },
  ]
  return <>
    <PageHeading eyebrow={`${today.toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase()}, GREAT THINGS START HERE`} title="Good morning, Amit ☀️" description="Here's what's happening at your club today." actions={<><button className="button button-quiet" onClick={() => onNavigate('Reports')}><FileBarChart2 size={16} />View reports</button><button className="button button-primary" onClick={() => onNavigate('Members')}><Plus size={17} />Add a member</button></>} />
    <div className="stat-grid dashboard-stat-grid">
      {stats.map(({ label, value, icon: Icon, iconClass, trend, note, tone }) => <div className="stat-card" key={label}><div className="stat-card-top"><span>{label}</span><span className={`stat-icon ${iconClass}`}><Icon size={17} /></span></div><strong className="stat-number">{value}</strong><div className="stat-foot"><span className={tone === 'positive' ? 'trend-positive' : 'trend-neutral'}>{tone === 'positive' ? <ArrowUpRight size={13} /> : <span className="tiny-dot" />}{trend}</span><span>{note}</span></div></div>)}
    </div>
    <div className="quick-metrics">
      <div className="quick-metric"><span className="quick-dot green" /><span>Inactive</span><strong>{dashboard.inactive}</strong></div><div className="quick-separator" />
      <div className="quick-metric"><span className="quick-dot red" /><span>Expired</span><strong>{dashboard.expired}</strong></div><div className="quick-separator" />
      <div className="quick-metric"><span className="quick-dot amber" /><span>On break</span><strong>{dashboard.breaks}</strong></div><div className="quick-separator" />
      <div className="quick-metric"><span className="quick-dot blue" /><span>Total memberships</span><strong>{dashboard.memberships}</strong></div>
      <div className="quick-end"><span>Memberships sold</span><strong>{dashboard.memberships} <small>this period</small></strong></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel registrations-panel">
        <div className="panel-heading"><div><div className="eyebrow">FRESH FACES</div><h2>Recent registrations</h2></div><button className="text-link" onClick={() => onNavigate('Members')}>View all <ArrowUpRight size={14} /></button></div>
        <div className="member-list">{recentMembers.map((member) => <button className="mini-member" key={member.id} onClick={() => onProfile(member.id)}><img src={member.avatar} alt="" /><span className="mini-member-copy"><strong>{member.name}</strong><span>Joined {formatDate(member.registrationDate)}</span></span><span className="member-arrow"><ArrowUpRight size={15} /></span></button>)}</div>
        <button className="panel-bottom-link" onClick={() => onNavigate('Members')}>See all members <ArrowRightIcon /></button>
      </section>
      <section className="panel expiring-panel"><div className="panel-heading"><div><div className="eyebrow">DON'T LET THEM GO</div><h2>Expiring memberships</h2></div><button className="text-link" onClick={() => { onNavigate('Members') }}>See all <ArrowUpRight size={14} /></button></div>
        {expiring.length ? <div className="expiring-list">{expiring.map((member) => <button className="expiring-row" key={member.id} onClick={() => onProfile(member.id)}><img src={member.avatar} alt="" /><span className="expiring-name"><strong>{member.name}</strong><small>{member.memberships[0]?.duration} membership</small></span><span className={`expiry-count ${daysRemaining(member) <= 5 ? 'expiry-urgent' : ''}`}>{daysRemaining(member)} days left</span><ChevronRight size={15} /></button>)}</div> : <EmptyState icon={<Check size={19} />} title="All caught up" text="No memberships expiring soon." />}</section>
    </div>
  </>
}

type UseDashboardType = { total: number; active: number; inactive: number; expired: number; expiring: number; breaks: number; memberships: number; revenue: number; monthlyRevenue: number }
function useDashboardType() { return {} as UseDashboardType }
function ArrowRightIcon() { return <ArrowUpRight size={14} /> }

function MembersPage({
  members, allCount, search, setSearch, gender, setGender, status, setStatus, duration, setDuration,
  expiry, setExpiry, daysFilter, setDaysFilter, sortBy, setSortBy, sortDirection, setSortDirection,
  onAdd, onEdit, onProfile,
}: {
  members: Member[]; allCount: number; search: string; setSearch: (value: string) => void
  gender: string; setGender: (value: string) => void; status: string; setStatus: (value: string) => void
  duration: string; setDuration: (value: string) => void; expiry: string; setExpiry: (value: string) => void
  daysFilter: string; setDaysFilter: (value: string) => void; sortBy: string; setSortBy: (value: string) => void
  sortDirection: 'asc' | 'desc'; setSortDirection: (value: 'asc' | 'desc') => void
  onAdd: () => void; onEdit: (member: Member) => void; onProfile: (id: string) => void
}) {
  const hasFilters = search || gender !== 'All genders' || status !== 'All statuses' || duration !== 'All durations' || expiry !== 'Any expiry' || daysFilter !== 'Any days remaining'
  const clearFilters = () => { setSearch(''); setGender('All genders'); setStatus('All statuses'); setDuration('All durations'); setExpiry('Any expiry'); setDaysFilter('Any days remaining') }
  return <>
    <PageHeading eyebrow="YOUR COMMUNITY" title="Members" description="Manage your members, memberships and their progress." actions={<><button className="button button-quiet desktop-only" onClick={() => window.print()}><FileBarChart2 size={16} />Export</button><button className="button button-primary" onClick={onAdd}><Plus size={17} />Add member</button></>} />
    <div className="member-summary-row"><div className="directory-summary"><div className="summary-icon"><Users size={18} /></div><div><strong>{allCount} members</strong><span>in your community</span></div></div><div className="directory-summary"><div className="summary-icon summary-icon-green"><Activity size={18} /></div><div><strong>{members.length} shown</strong><span>matching filters</span></div></div><div className="directory-summary directory-note"><span className="online-dot" />Membership records are up to date</div></div>
    <section className="panel directory-panel">
      <div className="directory-toolbar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or phone" aria-label="Search members" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14} /></button>}<kbd>⌘ K</kbd></div><div className="filter-label"><SlidersHorizontal size={15} />Filters</div></div>
      <div className="filters-row">
        <select value={gender} onChange={(event) => setGender(event.target.value)} aria-label="Filter by gender"><option>All genders</option><option>Female</option><option>Male</option><option>Other</option></select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Active</option><option>Expiring soon</option><option>Inactive</option><option>Expired</option><option>On break</option></select>
        <select value={duration} onChange={(event) => setDuration(event.target.value)} aria-label="Filter by duration"><option>All durations</option><option>1 month</option><option>2 months</option><option>5 months</option><option>Custom</option></select>
        <select value={expiry} onChange={(event) => setExpiry(event.target.value)} aria-label="Filter by expiry"><option>Any expiry</option><option>Next 7 days</option><option>Next 30 days</option><option>Already expired</option></select>
        <select value={daysFilter} onChange={(event) => setDaysFilter(event.target.value)} aria-label="Filter by days remaining"><option>Any days remaining</option><option>0–7 days</option><option>8–30 days</option><option>Expired</option></select>
        <div className="sort-control"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort by"><option value="name">Name</option><option value="days">Days left</option><option value="expiry">Expiry date</option><option value="registration">Recently joined</option></select><button className="sort-direction" onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}>{sortDirection === 'asc' ? <ArrowDown size={14} /> : <ArrowUpRight size={14} />}</button></div>
        {hasFilters && <button className="clear-filters" onClick={clearFilters}>Clear all</button>}
      </div>
      <div className="table-scroll"><table className="members-table"><thead><tr><th><input type="checkbox" aria-label="Select all members" /></th><th>MEMBER</th><th>GENDER</th><th>MEMBERSHIP</th><th>START DATE</th><th>EXPIRY DATE</th><th>PAID</th><th>STATUS</th><th>DAYS LEFT</th><th /></tr></thead><tbody>
        {members.map((member) => {
          const current = member.memberships[0]
          const statusValue = statusOf(member)
          const remaining = daysRemaining(member)
          return <tr key={member.id} onDoubleClick={() => onProfile(member.id)}><td><input type="checkbox" aria-label={`Select ${member.name}`} onClick={(event) => event.stopPropagation()} /></td><td><button className="table-member" onClick={() => onProfile(member.id)}><img src={member.avatar} alt="" /><span><strong>{member.name}</strong><small>{member.email}</small></span></button></td><td><span className="table-muted">{member.gender}</span></td><td><span className="duration-cell">{current?.duration ?? '—'}</span><small className="cell-subline">Purchased {current ? formatDate(current.purchaseDate) : '—'}</small></td><td><span className="table-muted">{current ? formatDate(current.startDate) : '—'}</span></td><td><span className="table-muted">{current ? formatDate(effectiveExpiry(member)) : '—'}</span></td><td><strong className="paid-value">{current ? money(current.amount) : '—'}</strong></td><td><StatusBadge status={statusValue} /></td><td><span className={`days-value ${remaining <= 7 && remaining >= 0 ? 'days-warning' : remaining < 0 ? 'days-expired' : ''}`}>{remaining < 0 ? `${Math.abs(remaining)}d overdue` : statusValue === 'On break' ? `${remaining}d paused` : `${remaining} days`}</span></td><td><MemberActions member={member} onProfile={onProfile} onEdit={onEdit} /></td></tr>
        })}
      </tbody></table></div>
      {members.length === 0 && <EmptyState icon={<Search size={20} />} title="No members found" text="Try changing your search or filters." action={hasFilters ? <button className="button button-quiet" onClick={clearFilters}>Clear filters</button> : undefined} />}
      <div className="table-footer"><span>Showing <strong>{members.length ? 1 : 0}–{members.length}</strong> of <strong>{members.length}</strong> members</span><div className="pagination"><button disabled aria-label="Previous page"><ChevronLeft size={15} /></button><button className="page-number">1</button><button disabled aria-label="Next page"><ChevronRight size={15} /></button></div></div>
    </section>
    <section className="mobile-member-list">
      {members.map((member) => <button className="mobile-member-card" key={member.id} onClick={() => onProfile(member.id)}><img src={member.avatar} alt="" /><span className="mobile-member-main"><strong>{member.name}</strong><small>{member.memberships[0]?.duration ?? 'No membership'} · {formatDate(member.registrationDate)}</small><StatusBadge status={statusOf(member)} /></span><span className="mobile-member-end"><strong>{daysRemaining(member)}d</strong><small>remaining</small></span><ChevronRight size={17} /></button>)}
      {!members.length && <EmptyState icon={<Users size={20} />} title="No members found" text="Try a different filter." />}
    </section>
  </>
}

function MemberActions({ member, onProfile, onEdit }: { member: Member; onProfile: (id: string) => void; onEdit: (member: Member) => void }) {
  const [open, setOpen] = useState(false)
  return <div className="action-menu-wrap"><button className="row-action" aria-label={`Actions for ${member.name}`} onClick={(event) => { event.stopPropagation(); setOpen(!open) }}><MoreHorizontal size={18} /></button>{open && <><button className="menu-scrim" aria-label="Close actions menu" onClick={() => setOpen(false)} /><div className="row-action-menu"><button onClick={() => { onProfile(member.id); setOpen(false) }}><UserRound size={14} />View profile</button><button onClick={() => { onEdit(member); setOpen(false) }}><Settings2 size={14} />Edit details</button></div></>}</div>
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const classes: Record<MemberStatus, string> = { Active: 'badge-active', 'Expiring soon': 'badge-expiring', Expired: 'badge-expired', 'On break': 'badge-break', Inactive: 'badge-inactive' }
  return <span className={`status-badge ${classes[status]}`}><i />{status.toUpperCase()}</span>
}

function MembershipsPage({ members, onProfile, onRenew }: { members: Member[]; onProfile: (id: string) => void; onRenew: (member: Member) => void }) {
  const [filter, setFilter] = useState('All')
  const shown = members.filter((member) => filter === 'All' || statusOf(member) === filter)
  const activeCount = members.filter((member) => ['Active', 'Expiring soon'].includes(statusOf(member))).length
  return <>
    <PageHeading eyebrow="PLANS & RENEWALS" title="Memberships" description="Track every plan, expiry date and renewal from one place." actions={<button className="button button-primary" onClick={() => onRenew(members[0])} disabled={!members.length}><Plus size={17} />Renew membership</button>} />
    <div className="stat-grid compact-stats"><SmallStat label="Total plans" value={members.reduce((count, member) => count + member.memberships.length, 0)} icon={<ShieldCheck size={17} />} /><SmallStat label="Active right now" value={activeCount} icon={<Activity size={17} />} /><SmallStat label="Expiring in 30 days" value={members.filter((member) => daysRemaining(member) >= 0 && daysRemaining(member) <= 30).length} icon={<Clock3 size={17} />} /><SmallStat label="On membership break" value={members.filter((member) => statusOf(member) === 'On break').length} icon={<Zap size={17} />} /></div>
    <section className="panel directory-panel membership-panel"><div className="panel-heading membership-heading"><div><div className="eyebrow">PLAN MANAGEMENT</div><h2>Member memberships</h2></div><select className="select-compact" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter memberships"><option>All</option><option>Active</option><option>Expiring soon</option><option>On break</option><option>Expired</option><option>Inactive</option></select></div>
      <div className="table-scroll"><table className="members-table"><thead><tr><th>MEMBER</th><th>PLAN</th><th>PURCHASED</th><th>START DATE</th><th>EXPIRES</th><th>AMOUNT</th><th>STATUS</th><th>TIME LEFT</th><th /></tr></thead><tbody>{shown.map((member) => <tr key={member.id}><td><button className="table-member" onClick={() => onProfile(member.id)}><img src={member.avatar} alt="" /><span><strong>{member.name}</strong><small>{member.email}</small></span></button></td><td>{member.memberships[0]?.duration ?? '—'}</td><td className="table-muted">{member.memberships[0] ? formatDate(member.memberships[0].purchaseDate) : '—'}</td><td className="table-muted">{member.memberships[0] ? formatDate(member.memberships[0].startDate) : '—'}</td><td className="table-muted">{formatDate(effectiveExpiry(member))}</td><td><strong>{money(member.memberships[0]?.amount ?? 0)}</strong></td><td><StatusBadge status={statusOf(member)} /></td><td className={daysRemaining(member) <= 7 ? 'days-warning' : ''}>{statusOf(member) === 'On break' ? 'Paused' : `${Math.max(daysRemaining(member), 0)} days`}</td><td><button className="button button-small button-quiet" onClick={() => onRenew(member)}><ArrowLeft size={13} />Renew</button></td></tr>)}</tbody></table></div>
      {shown.length === 0 && <EmptyState icon={<ShieldCheck size={20} />} title="No plans in this category" text="Choose a different status to see memberships." />}
    </section>
    <div className="info-callout"><div className="callout-icon"><Flame size={17} /></div><div><strong>Make renewals a retention moment</strong><p>Members whose memberships expire in the next 7 days are highlighted. Reach out early and keep their momentum going.</p></div></div>
  </>
}

function SmallStat({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return <div className="stat-card compact-stat"><div className="compact-stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>
}

function PaymentsPage({ members, payments, onAdd }: { members: Member[]; payments: Payment[]; onAdd: () => void }) {
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('All methods')
  const filtered = [...payments].filter((payment) => {
    const member = members.find((item) => item.id === payment.memberId)
    return (method === 'All methods' || payment.method === method) && (!query || `${member?.name} ${payment.reference}`.toLowerCase().includes(query.toLowerCase()))
  }).sort((a, b) => b.date.localeCompare(a.date))
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const thisMonth = payments.filter((payment) => payment.date.slice(0, 7) === isoDate(today).slice(0, 7)).reduce((sum, payment) => sum + payment.amount, 0)
  return <>
    <PageHeading eyebrow="MONEY IN MOTION" title="Payments" description="A clear view of every payment received at your club." actions={<button className="button button-primary" onClick={onAdd}><Plus size={17} />Record payment</button>} />
    <div className="stat-grid compact-stats"><SmallStat label="Total collected" value={money(total)} icon={<Wallet size={17} />} /><SmallStat label="Collected this month" value={money(thisMonth)} icon={<TrendingUp size={17} />} /><SmallStat label="Transactions" value={payments.length} icon={<CreditCard size={17} />} /><SmallStat label="Average payment" value={payments.length ? money(Math.round(total / payments.length)) : money(0)} icon={<Activity size={17} />} /></div>
    <section className="panel directory-panel payments-table-panel"><div className="payments-toolbar"><div><div className="eyebrow">TRANSACTION HISTORY</div><h2>All payments <span>{filtered.length}</span></h2></div><div className="payments-filters"><div className="search-field search-small"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" /></div><select className="select-compact" value={method} onChange={(event) => setMethod(event.target.value)} aria-label="Filter by payment method"><option>All methods</option><option>Cash</option><option>UPI</option><option>Debit/Credit Card</option><option>Bank Transfer</option></select></div></div>
      <div className="table-scroll"><table className="members-table payments-table"><thead><tr><th>MEMBER</th><th>MEMBERSHIP</th><th>PAYMENT DATE</th><th>METHOD</th><th>REFERENCE</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{filtered.map((payment) => {
        const member = members.find((item) => item.id === payment.memberId)
        const plan = member?.memberships.find((item) => item.id === payment.membershipId)
        return <tr key={payment.id}><td><div className="table-member"><img src={member?.avatar ?? avatar(1)} alt="" /><span><strong>{member?.name ?? 'Unknown member'}</strong><small>{member?.email ?? ''}</small></span></div></td><td>{plan?.duration ?? 'Membership'}</td><td className="table-muted">{formatDate(payment.date)}</td><td><span className="method-cell"><span className="method-icon"><CreditCard size={13} /></span>{payment.method}</span></td><td><code className="reference-code">{payment.reference}</code></td><td><span className="paid-badge"><i />Paid</span></td><td><strong className="paid-value">{money(payment.amount)}</strong></td></tr>
      })}</tbody></table></div>
      {!filtered.length && <EmptyState icon={<CreditCard size={20} />} title="No payments found" text="Adjust your search or record a new payment." />}
      <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{payments.length}</strong> transactions</span><span className="payments-foot-total">Total <strong>{money(filtered.reduce((sum, payment) => sum + payment.amount, 0))}</strong></span></div>
    </section>
  </>
}

function ReportsPage({ members, payments }: { members: Member[]; payments: Payment[] }) {
  const methods = ['Cash', 'UPI', 'Debit/Credit Card', 'Bank Transfer'] as PaymentMethod[]
  return <>
    <PageHeading eyebrow="INSIGHTS & TRENDS" title="Reports" description="Understand how SK FITNESS is growing and where to focus next." actions={<button className="button button-quiet" onClick={() => window.print()}><FileBarChart2 size={16} />Export report</button>} />
    <div className="stat-grid compact-stats"><SmallStat label="Total members" value={members.length} icon={<Users size={17} />} /><SmallStat label="Memberships sold" value={members.reduce((sum, member) => sum + member.memberships.length, 0)} icon={<ShieldCheck size={17} />} /><SmallStat label="Lifetime revenue" value={money(payments.reduce((sum, payment) => sum + payment.amount, 0))} icon={<Wallet size={17} />} /><SmallStat label="Renewal rate" value="76%" icon={<TrendingUp size={17} />} /></div>
    <div className="reports-grid"><section className="panel report-panel"><div className="panel-heading"><div><div className="eyebrow">REVENUE BREAKDOWN</div><h2>Payments by method</h2></div></div>{methods.map((item) => { const amount = payments.filter((payment) => payment.method === item).reduce((sum, payment) => sum + payment.amount, 0); const percent = payments.length ? Math.round(amount / payments.reduce((sum, payment) => sum + payment.amount, 0) * 100) : 0; return <div className="method-report" key={item}><div><span>{item}</span><strong>{money(amount)}</strong></div><div className="progress-track"><i style={{ width: `${percent}%` }} /></div><small>{percent}% of total revenue</small></div> })}</section>
      <section className="panel report-panel"><div className="panel-heading"><div><div className="eyebrow">MEMBER HEALTH</div><h2>Membership status</h2></div></div>{(['Active', 'Expiring soon', 'On break', 'Expired', 'Inactive'] as MemberStatus[]).map((item) => <div className="status-report" key={item}><StatusBadge status={item} /><strong>{members.filter((member) => statusOf(member) === item).length}</strong><span>members</span></div>)}</section></div>
    <div className="info-callout"><div className="callout-icon"><Sparkles size={17} /></div><div><strong>Your club is building momentum</strong><p>Member retention and recurring revenue insights are based on your current demo data. Changes you make update these reports instantly.</p></div></div>
  </>
}

function SettingsPage({ notify }: { notify: (message: string) => void }) {
  const [settings, setSettings] = useState({ expiryReminders: true, paymentAlerts: true, weeklyDigest: false })
  return <>
    <PageHeading eyebrow="YOUR WORKSPACE" title="Settings" description="Personalize your club preferences and notifications." />
    <div className="settings-layout"><section className="panel settings-panel"><div className="panel-heading"><div><div className="eyebrow">CLUB PROFILE</div><h2>Club information</h2></div><button className="button button-quiet button-small" onClick={() => notify('Club profile saved')}>Save changes</button></div><div className="settings-form"><label>Club name<input defaultValue="SK FITNESS" /></label><label>Contact email<input defaultValue="contact@skfitness.example.in" /></label><label>Phone number<input defaultValue="+91 98765 43000" /></label><label>Location<input defaultValue="Pune, Maharashtra, India" /></label><label>Currency<select defaultValue="INR"><option>INR — Indian Rupee</option></select></label></div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><div className="eyebrow">STAY IN THE LOOP</div><h2>Notification preferences</h2></div></div>{([{ key: 'expiryReminders', title: 'Membership expiry reminders', text: 'Get notified when a membership is about to expire.' }, { key: 'paymentAlerts', title: 'Payment activity', text: 'Get notified when a payment is recorded.' }, { key: 'weeklyDigest', title: 'Weekly club digest', text: 'A weekly overview of your members and revenue.' }] as const).map((item) => <label className="toggle-setting" key={item.key}><span><strong>{item.title}</strong><small>{item.text}</small></span><input type="checkbox" checked={settings[item.key]} onChange={(event) => setSettings((current) => ({ ...current, [item.key]: event.target.checked }))} /></label>)}</section></div>
  </>
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{text}</p>{action}</div>
}

function Modal({ title, description, onClose, children, size = 'medium' }: { title: string; description: string; onClose: () => void; children: ReactNode; size?: 'medium' | 'large' }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className={`modal-card ${size === 'large' ? 'modal-large' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><div className="eyebrow">SK FITNESS</div><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>{children}</section></div>
}

function FormField({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`form-field ${full ? 'field-full' : ''}`}><span>{label}</span>{children}</label>
}

function MemberFormModal({ member, onClose, onSubmit }: { member: Member | null; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [duration, setDuration] = useState<Duration>('1 month')
  return <Modal title={member ? 'Edit member' : 'Add a member'} description={member ? 'Update this member’s profile information.' : 'Add someone new to your club and get them started.'} onClose={onClose} size="large">
    <form onSubmit={onSubmit} className="modal-form">
      {!member && <label className="photo-upload"><span className="photo-upload-icon"><UserRound size={21} /></span><span><strong>Profile photo</strong><small>Upload a photo or leave blank to use a demo avatar.</small></span><input type="file" name="photo" accept="image/*" /></label>}
      <div className="form-grid">
        <FormField label="Full name"><input name="name" required placeholder="e.g. Kavya Reddy" defaultValue={member?.name} /></FormField>
        <FormField label="Date of birth"><input type="date" name="dob" required defaultValue={member?.dob} max={isoDate(today)} /></FormField>
        <FormField label="Gender"><select name="gender" defaultValue={member?.gender ?? 'Female'}><option>Female</option><option>Male</option><option>Other</option></select></FormField>
        <FormField label="Blood group"><select name="bloodGroup" defaultValue={member?.bloodGroup ?? 'O+'}><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>Unknown</option></select></FormField>
        <FormField label="Weight (kg)"><input type="number" name="weight" min="1" max="400" placeholder="65" defaultValue={member?.weight || ''} /></FormField>
        <FormField label="Phone number"><input name="phone" required placeholder="+91 98765 43210" defaultValue={member?.phone} /></FormField>
        <FormField label="Email address"><input type="email" name="email" required placeholder="name@example.in" defaultValue={member?.email} /></FormField>
        <FormField label="Registration date"><input type="date" name="registrationDate" required defaultValue={member?.registrationDate ?? isoDate(today)} /></FormField>
        <FormField label="Address" full><input name="address" required placeholder="Street, locality, Pune, Maharashtra" defaultValue={member?.address} /></FormField>
        {!member && <>
          <div className="form-section-title field-full"><span>GETTING STARTED</span><i /></div>
          <FormField label="Membership duration"><select name="duration" value={duration} onChange={(event) => setDuration(event.target.value as Duration)}><option>1 month</option><option>2 months</option><option>5 months</option><option>Custom</option></select></FormField>
          {duration === 'Custom' && <FormField label="Custom duration (days)"><input type="number" min="1" name="customDays" defaultValue="30" required /></FormField>}
          <FormField label="Purchase date"><input name="purchaseDate" type="date" required defaultValue={isoDate(today)} /></FormField>
          <FormField label="Membership start date"><input name="startDate" type="date" required defaultValue={isoDate(today)} /></FormField>
          <FormField label="Amount paid (INR)"><div className="input-prefix"><span>₹</span><input name="amount" type="number" min="0" step="0.01" required placeholder="899" /></div></FormField>
          <FormField label="Payment date"><input name="paymentDate" type="date" required defaultValue={isoDate(today)} /></FormField>
          <FormField label="Payment method"><select name="paymentMethod"><option>Cash</option><option>UPI</option><option>Debit/Credit Card</option><option>Bank Transfer</option></select></FormField>
          <FormField label="Transaction reference"><input name="reference" placeholder="Optional reference number" /></FormField>
        </>}
      </div>
      <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} />{member ? 'Save changes' : 'Add member'}</button></div>
    </form>
  </Modal>
}

function RenewModal({ member, onClose, onSubmit }: { member: Member; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [duration, setDuration] = useState<Duration>('2 months')
  const suggestedStart = daysRemaining(member) >= 0 ? addDays(effectiveExpiry(member), 1) : isoDate(today)
  return <Modal title="Renew membership" description={`Set up the next membership period for ${member.name}.`} onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}><div className="renew-context"><img src={member.avatar} alt="" /><div><strong>{member.name}</strong><span>Current plan: {member.memberships[0]?.duration ?? 'No plan'} · expires {member.memberships[0] ? formatDate(effectiveExpiry(member)) : 'today'}</span></div><StatusBadge status={statusOf(member)} /></div>
      <div className="form-grid"><FormField label="New duration"><select name="duration" value={duration} onChange={(event) => setDuration(event.target.value as Duration)}><option>1 month</option><option>2 months</option><option>5 months</option><option>Custom</option></select></FormField>{duration === 'Custom' && <FormField label="Custom duration (days)"><input name="customDays" type="number" min="1" defaultValue="30" required /></FormField>}<FormField label="New start date"><input name="startDate" type="date" required defaultValue={suggestedStart} /></FormField><FormField label="Amount paid (INR)"><div className="input-prefix"><span>₹</span><input name="amount" type="number" min="0" step="0.01" required placeholder="1499" /></div></FormField><FormField label="Payment date"><input name="paymentDate" type="date" required defaultValue={isoDate(today)} /></FormField><FormField label="Payment method"><select name="paymentMethod"><option>Cash</option><option>UPI</option><option>Debit/Credit Card</option><option>Bank Transfer</option></select></FormField><FormField label="Transaction reference" full><input name="reference" required placeholder="e.g. SKF-2026-001" /></FormField></div>
      <div className="renew-note"><ShieldCheck size={15} /><span>Previous memberships and payment history will stay on this member’s profile.</span></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><ArrowUpRight size={15} />Confirm renewal</button></div>
    </form>
  </Modal>
}

function BreakModal({ member, onClose, onSubmit }: { member: Member; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Pause membership" description={`Schedule a temporary membership break for ${member.name}.`} onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}><div className="pause-banner"><div><Clock3 size={17} /></div><span><strong>Countdown pauses during the break</strong><small>Unused membership time will be preserved automatically.</small></span></div><div className="form-grid"><FormField label="Break start date"><input type="date" name="startDate" min={isoDate(today)} required defaultValue={isoDate(today)} /></FormField><FormField label="Break end date"><input type="date" name="endDate" min={isoDate(today)} required defaultValue={shiftDate(7)} /></FormField><FormField label="Reason for break" full><select name="reason"><option>Travel & recovery</option><option>Injury or medical leave</option><option>Personal circumstances</option><option>Other</option></select></FormField></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Clock3 size={15} />Start break</button></div></form>
  </Modal>
}

function PaymentModal({ members, onClose, onSubmit }: { members: Member[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Record a payment" description="Add a payment to the member’s transaction history." onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><FormField label="Member" full><select name="memberId" required>{members.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></FormField><FormField label="Amount (INR)"><div className="input-prefix"><span>₹</span><input name="amount" type="number" min="0" step="0.01" required placeholder="899" /></div></FormField><FormField label="Payment date"><input type="date" name="date" required defaultValue={isoDate(today)} /></FormField><FormField label="Payment method"><select name="method"><option>Cash</option><option>UPI</option><option>Debit/Credit Card</option><option>Bank Transfer</option></select></FormField><FormField label="Transaction reference"><input name="reference" required placeholder="e.g. SKF-2026-001" /></FormField></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Check size={16} />Record payment</button></div></form>
  </Modal>
}

function NotificationPanel({ notices, onRead, onClose }: { notices: Notice[]; onRead: () => void; onClose: () => void }) {
  const iconMap = { warning: <Clock3 size={15} />, success: <Check size={15} />, danger: <Zap size={15} />, info: <UserRound size={15} /> }
  return <div className="notification-panel"><div className="notification-head"><div><strong>Notifications</strong><span>{notices.filter((notice) => !notice.read).length} unread</span></div><button onClick={onRead}>Mark all read</button><button className="notification-close" aria-label="Close notifications" onClick={onClose}><X size={15} /></button></div><div className="notification-items">{notices.map((notice) => <div key={notice.id} className={`notification-item ${notice.read ? '' : 'unread'}`}><div className={`notification-kind notice-${notice.kind}`}>{iconMap[notice.kind]}</div><div><strong>{notice.title}</strong><p>{notice.detail}</p><small>{notice.date === isoDate(today) ? 'Today' : formatDate(notice.date)}</small></div></div>)}</div><button className="notification-footer" onClick={() => { onRead(); onClose() }}>You’re all caught up <Check size={14} /></button></div>
}

function MemberProfile({ member, payments, onClose, onEdit, onRenew, onBreak, onEndBreak }: { member: Member; payments: Payment[]; onClose: () => void; onEdit: () => void; onRenew: () => void; onBreak: () => void; onEndBreak: () => void }) {
  const current = member.memberships[0]
  const status = statusOf(member)
  const remaining = daysRemaining(member)
  const pct = current ? Math.max(2, Math.min(100, remaining / current.durationDays * 100)) : 0
  const isOnBreak = status === 'On break'
  return <div className="profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="profile-drawer">
    <div className="profile-topbar"><span>MEMBER PROFILE</span><button className="icon-button" aria-label="Close profile" onClick={onClose}><X size={18} /></button></div>
    <div className="profile-hero"><div className="profile-avatar-wrap"><img src={member.avatar} alt={member.name} /><span className="profile-online" /></div><div className="profile-name-block"><h2>{member.name}</h2><span>Member since {formatDate(member.registrationDate)}</span></div><button className="icon-button" aria-label="Edit member" onClick={onEdit}><Settings2 size={17} /></button></div>
    <div className="profile-actions"><button className="button button-primary" onClick={onRenew}><ArrowUpRight size={15} />Renew membership</button><button className="button button-quiet" onClick={onBreak}><Clock3 size={15} />Pause</button></div>
    <div className="profile-scroll">
      <div className="profile-section-title"><span>MEMBERSHIP OVERVIEW</span><StatusBadge status={status} /></div>
      <div className="profile-plan-card"><div className="plan-card-top"><span className="plan-mark"><Dumbbell size={16} /></span><span className="plan-label">{current?.duration ?? 'No plan'} PLAN</span><span className="plan-amount">{money(current?.amount ?? 0)}</span></div><strong>{remaining < 0 ? 'Membership expired' : isOnBreak ? 'Your time is on pause' : `${remaining} days remaining`}</strong><div className="countdown-track"><i style={{ width: `${pct}%` }} /></div><div className="plan-card-bottom"><span>Started {current ? formatDate(current.startDate) : '—'}</span><span>{current ? formatDate(effectiveExpiry(member)) : '—'}</span></div>{isOnBreak && <div className="break-active-note">Countdown paused · ends {formatDate(member.breaks[0].endDate)} <button onClick={onEndBreak}>End break</button></div>}</div>
      <div className="profile-section-title"><span>PERSONAL INFORMATION</span><button onClick={onEdit}>Edit <ArrowUpRight size={12} /></button></div>
      <div className="profile-info-grid"><ProfileInfo label="Email" value={member.email} /><ProfileInfo label="Phone" value={member.phone} /><ProfileInfo label="Gender" value={member.gender} /><ProfileInfo label="Date of birth" value={formatDate(member.dob)} /><ProfileInfo label="Blood group" value={member.bloodGroup} /><ProfileInfo label="Weight" value={`${member.weight} kg`} /><ProfileInfo label="Address" value={member.address} full /></div>
      <div className="profile-section-title profile-history-heading"><span>PAYMENT HISTORY</span><span>{payments.length} transactions</span></div>
      {payments.length ? <div className="profile-history-list">{payments.slice(0, 5).map((payment) => <div className="history-row" key={payment.id}><span className="history-icon"><CreditCard size={14} /></span><span><strong>{money(payment.amount)} <small>· {payment.method}</small></strong><span>{formatDate(payment.date)} · {payment.reference}</span></span><span className="paid-badge"><i />Paid</span></div>)}</div> : <div className="history-empty">No payments have been recorded.</div>}
      <div className="profile-section-title profile-history-heading"><span>MEMBERSHIP HISTORY</span><span>{member.memberships.length} plans</span></div>
      <div className="profile-history-list">{member.memberships.map((plan, index) => <div className="history-row" key={plan.id}><span className={`history-icon ${index === 0 ? 'history-current' : ''}`}><ShieldCheck size={14} /></span><span><strong>{plan.duration} membership {index === 0 && <small>· Current</small>}</strong><span>{formatDate(plan.startDate)} — {formatDate(plan.expiryDate)}</span></span><b className="history-amount">{money(plan.amount)}</b></div>)}</div>
      <div className="profile-section-title profile-history-heading"><span>BREAK HISTORY</span><span>{member.breaks.length} breaks</span></div>
      {member.breaks.length ? <div className="profile-history-list">{member.breaks.map((period, index) => { const isActiveBreak = !period.endedEarly && period.startDate <= isoDate(today) && period.endDate >= isoDate(today); const breakStatus = period.endedEarly ? 'Ended' : isActiveBreak ? 'Active' : period.endDate < isoDate(today) ? 'Ended' : 'Scheduled'; return <div className="history-row" key={`${period.startDate}-${index}`}><span className="history-icon history-break"><Clock3 size={14} /></span><span><strong>{period.reason}</strong><span>{formatDate(period.startDate)} — {formatDate(period.endDate)}</span></span><span className={`break-state ${isActiveBreak ? 'break-state-active' : ''}`}>{breakStatus}</span></div> })}</div> : <div className="history-empty">No break history yet. <button onClick={onBreak}>Add a break</button></div>}
      <div className="profile-section-title profile-history-heading"><span>STATUS HISTORY</span></div>
      <div className="status-timeline">{member.statusHistory.map((entry, index) => <div className="timeline-entry" key={`${entry.date}-${index}`}><span className="timeline-dot" /><div><strong>{entry.status}</strong><span>{entry.note}</span></div><small>{formatDate(entry.date)}</small></div>)}</div>
    </div>
  </aside></div>
}

function ProfileInfo({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return <div className={`profile-info ${full ? 'info-full' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}
