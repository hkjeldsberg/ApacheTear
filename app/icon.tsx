import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <svg
        viewBox="0 0 32 32"
        width="32"
        height="32"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Teardrop: pointed tip at top, round base at bottom */}
        <path
          d="M16 2 C 8 10 6 16 6 22 A 10 10 0 0 0 26 22 C 26 16 24 10 16 2 Z"
          fill="black"
        />
      </svg>
    ),
    { ...size }
  )
}
