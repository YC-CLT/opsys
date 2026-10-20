export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}