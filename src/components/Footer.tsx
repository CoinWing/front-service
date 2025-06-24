export default function Footer() {
  return (
    <footer className="bg-blue-50 text-gray-600 text-right py-4 border-t">
      <p className="text-sm mr-4">&copy; {new Date().getFullYear()} CoWing. All rights reserved.</p>
    </footer>
  )
}