type ReservationSmsInput = {
  date: string;
  time: string;
  guests: number;
};

export function buildReservationSms(
  reservation: ReservationSmsInput,
  config: { mapsUrl: string; signature: string }
) {
  return `
Rezervasyonunuz olusturuldu.
Tarih: ${reservation.date} Saat: ${reservation.time} Kisi: ${reservation.guests}
Konum: ${config.mapsUrl}
${config.signature}
`.trim();
}
