const Footer = () => (
  <footer className="mt-12 border-t border-[rgba(255,45,120,0.2)] bg-[#08000F] py-8">
    <div className="mx-auto grid max-w-6xl gap-4 px-4 text-sm text-[#E0AEFF] md:grid-cols-4">
      <p className="logo text-[#FF2D78]">About EventPulse</p>
      <p className="transition hover:text-[#FF2D78]">Contact</p>
      <a className="transition hover:text-[#FF2D78]" href="https://developer.ticketmaster.com/" target="_blank" rel="noreferrer">
        Ticketmaster API
      </a>
      <p className="transition hover:text-[#FF2D78]">Social: X / Instagram / YouTube</p>
      <p className="md:col-span-4 md:mt-2">Press ? for shortcuts</p>
    </div>
  </footer>
)

export default Footer
