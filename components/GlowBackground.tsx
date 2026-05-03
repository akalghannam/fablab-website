interface GlowBackgroundProps {
  variant?: 'default' | 'hero' | 'auth'
}

export function GlowBackground({ variant = 'default' }: GlowBackgroundProps) {
  if (variant === 'auth') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full opacity-25 animate-glow"
          style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full opacity-20 animate-glow"
          style={{ background: 'radial-gradient(circle, #ff8a00 0%, transparent 70%)', filter: 'blur(70px)', animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 60%)', filter: 'blur(80px)' }} />
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[5%] w-[600px] h-[600px] rounded-full opacity-20 animate-glow"
          style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-15%] left-[0%] w-[500px] h-[500px] rounded-full opacity-15 animate-glow"
          style={{ background: 'radial-gradient(circle, #ff8a00 0%, transparent 65%)', filter: 'blur(90px)', animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[250px] h-[250px] rounded-full opacity-10 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 60%)', filter: 'blur(50px)' }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[20%] right-[-5%] w-[350px] h-[350px] rounded-full opacity-15 animate-glow"
        style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-10 animate-glow"
        style={{ background: 'radial-gradient(circle, #ff8a00 0%, transparent 70%)', filter: 'blur(70px)', animationDelay: '2s' }} />
    </div>
  )
}
