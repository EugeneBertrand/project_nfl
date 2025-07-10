export default function FootballField() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main field background */}
      <div className="absolute inset-0 bg-field-green">
        {/* Yard lines */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-0.5 bg-field-line animate-field-scroll"
              style={{
                top: `${i * 120 - 60}px`,
                animationDelay: `${-i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        {/* Center field line */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-field-line/20 transform -translate-x-1/2" />
        
        {/* Hash marks */}
        <div className="absolute left-1/3 top-0 w-0.5 h-full bg-field-line/10 transform -translate-x-1/2" />
        <div className="absolute right-1/3 top-0 w-0.5 h-full bg-field-line/10 transform translate-x-1/2" />
        
        {/* End zones (top and bottom) */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-field-endzone/30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-field-endzone/30" />
      </div>
      
      {/* Field texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 60px 60px'
        }}
      />
    </div>
  );
}