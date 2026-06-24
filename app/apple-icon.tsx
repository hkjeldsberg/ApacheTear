import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <svg
        viewBox="0 0 180 180"
        width="180"
        height="180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width="180" height="180" rx="40" ry="40" fill="white" />
        {/* Teardrop: pointed tip at top, round base at bottom */}
        <path
          d="M90 11.25 C 45 56.25 33.75 90 33.75 123.75 A 56.25 56.25 0 0 0 146.25 123.75 C 146.25 90 135 56.25 90 11.25 Z"
          fill="black"
        />
      </svg>
    ),
    { ...size }
  )
}
