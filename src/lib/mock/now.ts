// Riferimento temporale reale dell'app: usato al posto di `new Date()` diretto
// così eventuali logiche di test/preview possono sostituirlo in un unico punto.
export function getNow(): Date {
  return new Date();
}
