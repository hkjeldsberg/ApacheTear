export function printNoteToPdf(): void {
  const target = document.querySelector('.print-target')
  if (target) {
    target.setAttribute('data-printing', '')
  }

  window.addEventListener(
    'afterprint',
    () => {
      if (target) {
        target.removeAttribute('data-printing')
      }
    },
    { once: true },
  )

  window.print()
}
