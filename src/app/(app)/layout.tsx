import Link from 'next/link'

const tabs = [
  { href: '/scorecard', label: 'Numbers' },
  { href: '/priorities', label: 'Top 3' },
  { href: '/huddle', label: 'Huddle' },
  { href: '/settings', label: 'More' },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-16">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-lg justify-around">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center py-3 px-3 text-xs text-gray-500 hover:text-gray-900"
              data-testid={`tab-${tab.label.toLowerCase().replace(' ', '-')}`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
