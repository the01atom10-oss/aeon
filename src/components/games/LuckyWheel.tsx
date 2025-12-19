'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Prize {
  id: string
  name: string
  imageUrl: string | null
  prizeType: string
  value: number | null
  color: string | null
  probability: number
  description?: string | null
}

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#FF8B94',
  '#C7CEEA',
  '#A8E6CF',
  '#FFD3B6',
]

const SPIN_DURATION_MS = 5000

function safeColor(input: string | null | undefined, fallback: string) {
  const s = (input || '').trim()
  if (s && typeof window !== 'undefined' && (window as any).CSS?.supports?.('color', s)) return s
  return fallback
}

/**
 * Build a sector clip-path polygon that follows the arc with multiple points.
 * This avoids the degenerate triangle issue when segmentAngle = 180 (2 prizes).
 */
function buildSectorClip(angleDeg: number, stepDeg = 6) {
  const a = Math.max(1, Math.min(360, angleDeg))
  const steps = Math.max(2, Math.ceil(a / stepDeg))

  const pts: string[] = ['50% 50%'] // center
  for (let i = 0; i <= steps; i++) {
    const t = ((a * i) / steps) * (Math.PI / 180)
    const x = 50 + 50 * Math.sin(t)
    const y = 50 - 50 * Math.cos(t)
    pts.push(`${x.toFixed(3)}% ${y.toFixed(3)}%`)
  }
  return `polygon(${pts.join(', ')})`
}

export default function LuckyWheel() {
  // session không bắt buộc cho UI, nhưng giữ để auth cookie hoạt động nếu API dùng next-auth
  const { data: session } = useSession()

  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [freeSpins, setFreeSpins] = useState(0)
  const [balance, setBalance] = useState(0)
  const [spinsToday, setSpinsToday] = useState(0)

  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/lucky-wheel/status')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData?.error || 'Không thể tải dữ liệu vòng quay')
        return
      }

      const data = await response.json()

      setFreeSpins(data.freeSpins || 0)
      setBalance(data.balance || 0)
      setSpinsToday(data.spinsToday || 0)

      const prizesData: Prize[] = data.prizes || []
      if (prizesData.length === 0) {
        setPrizes([])
        setError('Chưa có giải thưởng nào. Vui lòng liên hệ admin để thêm giải thưởng.')
        return
      }

      const prizesWithColors = prizesData.map((p, index) => ({
        ...p,
        color: safeColor(p.color, DEFAULT_COLORS[index % DEFAULT_COLORS.length]),
      }))
      setPrizes(prizesWithColors)
    } catch (e) {
      console.error('Failed to load user data:', e)
      setError('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Fixed 10 segments on the wheel
  const WHEEL_SEGMENTS = 10
  const segmentAngle = useMemo(() => 360 / WHEEL_SEGMENTS, [])

  // Generate random colors for each segment
  const segmentColors = useMemo(() => {
    return Array.from({ length: WHEEL_SEGMENTS }, () => {
      const hue = Math.floor(Math.random() * 360)
      const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
      const lightness = 50 + Math.floor(Math.random() * 20) // 50-70%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    })
  }, [])

  // Map prizes to segments (distribute prizes across 10 segments)
  const prizeSegmentMap = useMemo(() => {
    const map: (Prize | null)[] = new Array(WHEEL_SEGMENTS).fill(null)
    if (prizes.length === 0) return map
    
    // Distribute prizes evenly across segments
    prizes.forEach((prize, index) => {
      const segmentIndex = Math.floor((index * WHEEL_SEGMENTS) / prizes.length)
      if (segmentIndex < WHEEL_SEGMENTS) {
        map[segmentIndex] = prize
      }
    })
    
    // Fill remaining segments with random prizes
    for (let i = 0; i < WHEEL_SEGMENTS; i++) {
      if (map[i] === null && prizes.length > 0) {
        map[i] = prizes[Math.floor(Math.random() * prizes.length)]
      }
    }
    
    return map
  }, [prizes])

  const baseGeometry = useMemo(() => {
    // Clip-path sector (arc sampled) => works for 1, 2, 3... prizes
    const clip = buildSectorClip(segmentAngle, 6)

    // Positions are based on the base sector mid-angle
    const midRad = ((segmentAngle / 2) * Math.PI) / 180
    const imageRadius = 25

    const imageX = 50 + imageRadius * Math.sin(midRad)
    const imageY = 50 - imageRadius * Math.cos(midRad)

    return { clip, imageX, imageY }
  }, [segmentAngle])

  const spinWheel = async () => {
    if (isSpinning || freeSpins <= 0 || prizes.length === 0) return

    setIsSpinning(true)
    setShowResult(false)

    try {
      const response = await fetch('/api/lucky-wheel/spin', { method: 'POST' })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        alert(err?.error || 'Có lỗi xảy ra!')
        setIsSpinning(false)
        return
      }

      const data = await response.json()
      const wonPrize = prizes.find((p) => p.id === data.prizeId)
      if (!wonPrize) {
        setIsSpinning(false)
        return
      }

      // Create prize object with full details from API response
      const fullPrizeDetails: Prize = {
        ...wonPrize,
        imageUrl: data.prizeImage || wonPrize.imageUrl,
        description: data.prizeDescription || null
      }

      // Find which segment contains this prize
      const segmentIndex = prizeSegmentMap.findIndex((p) => p?.id === wonPrize.id)
      const targetCenterAngle = segmentIndex * segmentAngle + segmentAngle / 2

      const fullRotations = 5 + Math.random() * 2
      const addRotation = 360 * fullRotations + (360 - targetCenterAngle)

      setRotation((prev) => prev + addRotation)

      window.setTimeout(() => {
        setSelectedPrize(fullPrizeDetails)
        setShowResult(true)
        setIsSpinning(false)
        setFreeSpins(data.freeSpins || 0)
        setSpinsToday((prev) => prev + 1)
      }, SPIN_DURATION_MS)
    } catch (e) {
      console.error('Failed to spin:', e)
      alert('Có lỗi xảy ra!')
      setIsSpinning(false)
    }
  }

  const closeResult = () => {
    setShowResult(false)
    setSelectedPrize(null)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Đang tải vòng quay...</p>
      </div>
    )
  }

  if (error || prizes.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">🎰</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {error ? 'Có lỗi xảy ra' : 'Chưa có giải thưởng'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'Vui lòng liên hệ admin để thêm giải thưởng vào vòng quay.'}
        </p>
        <button
          onClick={loadUserData}
          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
        >
          🔄 Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto px-2 sm:px-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
          <p className="text-xs sm:text-sm opacity-90">Lượt quay miễn phí</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold">{freeSpins}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
          <p className="text-xs sm:text-sm opacity-90">Số dư</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold">${balance.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
          <p className="text-xs sm:text-sm opacity-90">Quay hôm nay</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold">{spinsToday}</p>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative w-full aspect-square max-w-md mx-auto mb-4 sm:mb-6 md:mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 -mt-1 sm:-mt-2">
          <div className="w-0 h-0 border-l-[15px] sm:border-l-[20px] border-l-transparent border-r-[15px] sm:border-r-[20px] border-r-transparent border-t-[30px] sm:border-t-[40px] border-t-red-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative w-full h-full rounded-full shadow-2xl overflow-hidden bg-white">
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-[5000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
            }}
          >
            {Array.from({ length: WHEEL_SEGMENTS }, (_, index) => {
              const segmentRotation = index * segmentAngle
              const clip = baseGeometry.clip
              const segmentColor = segmentColors[index]
              const prize = prizeSegmentMap[index]

              return (
                <div
                  key={`segment-${index}`}
                  className="absolute inset-0 origin-center"
                  style={{
                    transform: `rotate(${segmentRotation}deg)`,
                    clipPath: clip,
                    WebkitClipPath: clip,
                  }}
                >
                  <div className="w-full h-full relative" style={{ backgroundColor: segmentColor }}>
                    {/* Gift Box Icon - Always show emoji, never show real image */}
                    <div
                      className="absolute"
                      style={{
                        left: `${baseGeometry.imageX}%`,
                        top: `${baseGeometry.imageY}%`,
                        transform: `translate(-50%, -50%) rotate(${-segmentRotation}deg)`,
                        zIndex: 10,
                        pointerEvents: 'none',
                      }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg bg-white/40 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl border-2 border-white/80 shadow-2xl">
                        🎁
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center Circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl border-4 border-white flex items-center justify-center">
              <p className="text-white font-bold text-[10px] sm:text-xs text-center leading-tight">
                MIỄN
                <br />
                PHÍ
              </p>
            </div>
          </div>

          {/* Outer rings */}
          <div className="absolute inset-0 rounded-full pointer-events-none z-20">
            <div className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-inner" />
            <div className="absolute inset-2 rounded-full border-4 border-yellow-200" />
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <button
          onClick={spinWheel}
          disabled={isSpinning || freeSpins <= 0}
          className={`px-6 sm:px-10 md:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-2xl transition-all duration-300 transform ${
            isSpinning || freeSpins <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:scale-110 active:scale-95 text-white animate-pulse'
          }`}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Đang quay...</span>
            </span>
          ) : freeSpins <= 0 ? (
            <span className="text-sm sm:text-base md:text-xl">Hết lượt quay miễn phí</span>
          ) : (
            '🎰 QUAY NGAY!'
          )}
        </button>

        <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
          Bạn còn <span className="font-bold text-yellow-600">{freeSpins}</span> lượt quay miễn phí
        </p>
        <p className="text-xs text-gray-500 mt-1">💡 Hoàn thành nhiệm vụ để nhận thêm lượt quay</p>
      </div>

      {/* Prize Info */}
      <div className="mt-4 sm:mt-6 md:mt-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">🎁 Giải thưởng</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="flex flex-col items-center space-y-2 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {prize.imageUrl ? (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                  <img
                    src={
                      prize.imageUrl.startsWith('http')
                        ? prize.imageUrl
                        : prize.imageUrl.startsWith('/')
                          ? prize.imageUrl
                          : `/${prize.imageUrl}`
                    }
                    alt={prize.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png'
                      e.currentTarget.onerror = null
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-3xl sm:text-4xl shadow-md"
                  style={{ backgroundColor: prize.color || '#4ECDC4' }}
                >
                  🎁
                </div>
              )}

              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{prize.name}</p>
                {prize.value != null && <p className="text-xs text-gray-500 mt-1">${prize.value.toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center animate-bounceIn shadow-2xl">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Chúc mừng!
            </h2>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
              🎉 Bạn đã nhận được quà!
            </h2>

            <div className="mb-4 sm:mb-6">
              {/* Prize Image - Show real image in result modal */}
              {selectedPrize.imageUrl ? (
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 rounded-xl overflow-hidden border-4 border-yellow-400 shadow-2xl">
                  <img
                    src={
                      selectedPrize.imageUrl.startsWith('http')
                        ? selectedPrize.imageUrl
                        : selectedPrize.imageUrl.startsWith('/')
                          ? selectedPrize.imageUrl
                          : `/${selectedPrize.imageUrl}`
                    }
                    alt={selectedPrize.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png'
                      e.currentTarget.onerror = null
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 rounded-xl flex items-center justify-center text-6xl sm:text-7xl shadow-2xl"
                  style={{ backgroundColor: selectedPrize.color || '#4ECDC4' }}
                >
                  🎁
                </div>
              )}

              {/* Prize Name */}
              <div
                className="text-xl sm:text-2xl font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-white mb-3"
                style={{ backgroundColor: selectedPrize.color || '#4ECDC4' }}
              >
                {selectedPrize.name}
              </div>

              {/* Prize Description */}
              {selectedPrize.description && (
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {selectedPrize.description}
                  </p>
                </div>
              )}

              {/* Prize Value */}
              {selectedPrize.value != null && (
                <p className="text-base sm:text-lg font-semibold text-gray-700">
                  💰 Giá trị: <span className="text-green-600">${selectedPrize.value.toLocaleString()}</span>
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Lượt quay còn lại: <span className="font-bold text-yellow-600">{freeSpins}</span>
            </p>

            <button
              onClick={closeResult}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
