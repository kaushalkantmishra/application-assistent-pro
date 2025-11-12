"use client"

interface AnalogClockProps {
  time: Date
  size?: number
}

export function AnalogClock({ time, size = 40 }: AnalogClockProps) {
  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const hourAngle = (hours * 30) + (minutes * 0.5)
  const minuteAngle = minutes * 6
  const secondAngle = seconds * 6

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Clock face */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
        
        {/* Hour hand */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + (size / 4) * Math.cos((hourAngle - 90) * Math.PI / 180)}
          y2={size / 2 + (size / 4) * Math.sin((hourAngle - 90) * Math.PI / 180)}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-foreground"
        />
        
        {/* Minute hand */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + (size / 3) * Math.cos((minuteAngle - 90) * Math.PI / 180)}
          y2={size / 2 + (size / 3) * Math.sin((minuteAngle - 90) * Math.PI / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-foreground"
        />
        
        {/* Second hand */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + (size / 3) * Math.cos((secondAngle - 90) * Math.PI / 180)}
          y2={size / 2 + (size / 3) * Math.sin((secondAngle - 90) * Math.PI / 180)}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="text-red-500"
        />
        
        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="2"
          fill="currentColor"
          className="text-foreground"
        />
      </svg>
    </div>
  )
}