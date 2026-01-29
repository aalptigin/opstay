// Consolidated Panel Core API (Reservations, Records, Requests)
import { NextRequest, NextResponse } from "next/server";
import { gsCall, requireRole } from "@/lib/gs-gateway";
import { getSmsConfigByName, buildReservationSmsText } from "@/lib/sms";

export const runtime = "edge";

// --- Helpers (copied from individual files) ---

function s(v: any) { return String(v ?? "").trim(); }

function pick(obj: any, keys: string[]) {
    for (const k of keys) {
        const v = obj?.[k];
        if (v === null || v === undefined) continue;
        const sv = s(v);
        if (sv !== "") return v;
    }
    return "";
}

function normPhone(v: any) { return String(v ?? "").replace(/[^\d+]/g, "").trim(); }

/* Date/Time Normalizers */
function fmtDateTR(d: Date) {
    return new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" }).format(d).replace(/\./g, "/");
}
function fmtTimeTR(d: Date) {
    return new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}
function normalizeDate(value: any) {
    const raw = s(value);
    if (!raw) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return fmtDateTR(d);
    return raw;
}
function normalizeTime(value: any) {
    const raw = s(value);
    if (!raw) return "";
    if (/^\d{2}:\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return fmtTimeTR(d);
    const m = raw.match(/^(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
    return raw;
}
function normalizeFromDatetime(date: string, time: string, datetime: string) {
    if (date && time) return { date, time };
    const dt = s(datetime);
    if (!dt) return { date, time };
    const d = new Date(dt);
    if (!Number.isNaN(d.getTime())) return { date: date || fmtDateTR(d), time: time || fmtTimeTR(d) };
    const m = dt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) return { date: date || `${m[3]}/${m[2]}/${m[1]}`, time: time || `${m[4]}:${m[5]}` };
    return { date, time };
}

/* SMS Helpers */
function makeMessageId() {
    try {
        const anyCrypto: any = (globalThis as any).crypto;
        if (anyCrypto && typeof anyCrypto.randomUUID === "function") return `SIM-${anyCrypto.randomUUID()}`;
    } catch { }
    return `SIM-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}
async function sendDryRunSms(payload: { to: string; senderId: string; text: string; }) {
    console.log("📩 DRY-RUN SMS", { ...payload, mode: "dry_run" });
    return { ok: true, mode: "dry_run" as const, messageId: makeMessageId() };
}

/* Response Parsers */
function pickRowsFromGsResult(r: any) {
    if (Array.isArray(r?.rows)) return r.rows;
    if (Array.isArray(r?.data?.rows)) return r.data.rows;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    if (Array.isArray(r?.data?.result?.rows)) return r.data.result.rows;
    return [];
}

/* Row Normalizers */
function normalizeRecordRow(row: any) {
    const reservation_no = s(pick(row, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id", "rez_no"]));
    const restaurant_name = s(pick(row, ["restaurant_name", "restaurant", "restuarant", "restaurantName"]));
    const table_no = s(pick(row, ["table_no", "table_n0", "masa_no", "tableNumber"]));
    const full_name = s(pick(row, ["full_name", "customer_full_name", "guest_full_name", "name_surname"]));
    const phone = s(pick(row, ["phone", "customer_phone", "guest_phone", "telefon"]));
    const date = normalizeDate(pick(row, ["date", "gun_ay_yil", "dayMonthYear", "created_date"]));
    const time = normalizeTime(pick(row, ["time", "saat", "created_time"]));
    const authorized_name = s(pick(row, ["authorized_name", "officer_name", "added_by_name", "created_by_name", "authorized_na"]));
    const authorized_email = s(pick(row, ["authorized_email", "officer_email", "added_by", "added_by_email", "authorized_email "]));
    const child_u7 = s(pick(row, ["child_u7", "kids_u7", "children_u7", "cocuk_7_alti"]));
    const risk_level = s(pick(row, ["risk_level", "risk", "riskLevel", "severity", "level"]));
    const note = s(pick(row, ["note", "blacklist_note", "customer_note", "summary", "not"]));

    return {
        ...row, reservation_no, restaurant_name, table_no, full_name, phone, date, time, child_u7, risk_level, authorized_name, authorized_email, note,
        reservation_n0: reservation_no, table_n0: table_no, customer_full_name: full_name, customer_phone: phone, kids_u7: child_u7, risk: risk_level, officer_name: authorized_name, officer_email: authorized_email,
    };
}

function normStatus(v: any) {
    const x = s(v).toLowerCase();
    if (x === "open" || x === "new" || x === "yeni") return "open";
    if (x === "in_review" || x === "review" || x === "inreview" || x === "incelemede") return "in_review";
    if (x === "resolved" || x === "closed" || x === "done" || x === "kapandi" || x === "kapandı") return "resolved";
    if (x === "rejected" || x === "reject" || x === "reddedildi") return "rejected";
    return "open";
}

function normalizeRequestRow(row: any) {
    const request_id = s(pick(row, ["request_id", "id", "req_id", "requestId"]));
    const created_at = s(pick(row, ["created_at", "createdAt", "date", "timestamp", "time"]));
    const guest_full_name = s(pick(row, ["guest_full_name", "subject_person_name", "full_name", "customer_full_name", "name_surname"]));
    const guest_phone = s(pick(row, ["guest_phone", "subject_phone", "phone", "customer_phone", "telefon"]));
    const summary = s(pick(row, ["summary", "reason", "note", "message", "description"]));
    const status = normStatus(pick(row, ["status", "state", "durum"]));
    const response_text = s(pick(row, ["response_text", "manager_response", "manager_response_text", "response", "reply"]));

    return {
        ...row, request_id, created_at, guest_full_name, guest_phone, summary, status, response_text,
        manager_response: response_text, manager_response_text: response_text, subject_person_name: guest_full_name, subject_phone: guest_phone, reason: summary,
    };
}


// --- Handlers ---

// ALL POST handlers
async function handlePost(req: NextRequest, route: string, subAction?: string) {
    const body = await req.json().catch(() => ({}));

    // RESERVATIONS
    if (route === "reservations") {
        if (subAction === "update") {
            // Update Reservation
            const reservation_id = s(pick(body, ["reservation_id", "resarvation_id", "id"]));
            const reservation_no = s(pick(body, ["reservation_no", "reservation_n0", "rez_no"]));
            const effective_id = reservation_id || reservation_no;
            if (!effective_id) return NextResponse.json({ ok: false, error: "ID gerekli" }, { status: 400 });

            const restaurant = s(pick(body, ["restaurant", "restaurant_name"]));
            const r = await gsCall<any>("reservations.update", {
                reservation_id: effective_id, reservation_no: reservation_no || undefined, restaurant, restaurant_name: restaurant,
                table_no: s(pick(body, ["table_no", "table_n0", "masa_no"])),
                date: s(pick(body, ["date", "gun_ay_yil"])), time: s(pick(body, ["time", "saat"])),
                customer_full_name: s(pick(body, ["customer_full_name", "full_name"])),
                customer_phone: normPhone(pick(body, ["customer_phone", "phone"])),
                note: s(pick(body, ["note", "customer_note"])),
                kids_u7: s(pick(body, ["kids_u7", "child_u7", "children_u7"])) || undefined,
            });
            if (!r?.ok) return NextResponse.json({ ok: false, error: s(r?.error) || "Update failed" }, { status: 400 });
            return NextResponse.json({ ok: true });
        } else {
            // Create Reservation
            const restaurant_name = s(pick(body, ["restaurant_name", "restaurant"]));
            const reservation_no = s(pick(body, ["reservation_no", "reservationNumber", "reservation_id"]));
            let date = normalizeDate(pick(body, ["date", "gun_ay_yil"]));
            let time = normalizeTime(pick(body, ["time", "saat"]));
            ({ date, time } = normalizeFromDatetime(date, time, s(pick(body, ["datetime"]))));
            const total_guests = s(pick(body, ["total_guests", "people_count", "guest_count", "kisi_sayisi_toplam"]));
            const customer_phone = s(pick(body, ["customer_phone", "phone", "guest_phone"]));

            const r = await gsCall("reservations.add", {
                restaurant_name, reservation_no, date, time, customer_phone,
                datetime: s(pick(body, ["datetime"])),
                customer_full_name: s(pick(body, ["customer_full_name", "full_name", "guest_full_name"])),
                table_no: s(pick(body, ["table_no", "masa_no", "tableNumber"])),
                kids_u7: s(pick(body, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"])),
                total_guests,
                officer_name: s(pick(body, ["officer_name", "authorized_name", "added_by_name"])),
                note: s(pick(body, ["note"])) || "",
            });
            if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

            // SMS Logic
            try {
                if (process.env.NETGSM_MODE === "DRY_RUN") {
                    const cfg = getSmsConfigByName(restaurant_name);
                    if (cfg && customer_phone) {
                        const smsText = buildReservationSmsText({ date, time, totalGuests: total_guests, mapsUrl: cfg.mapsUrl, signature: cfg.signature });
                        const smsRes = await sendDryRunSms({ to: customer_phone, senderId: cfg.senderId, text: smsText });
                        await gsCall("sms.log.add", { reservation_no, restaurant: restaurant_name, customer_phone, sender_id: cfg.senderId, message: smsText, mode: "DRY_RUN", status: smsRes.ok ? "SENT" : "FAILED" });
                    }
                }
            } catch (smsErr) { console.error("SMS Error", smsErr); }
            return NextResponse.json({ ok: true });
        }
    }

    // RECORDS
    if (route === "records") {
        if (subAction === "check") {
            // Check Record
            const r = await gsCall<any[]>("records.check", { phone: body.phone, full_name: body.full_name });
            if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
            return NextResponse.json({ matches: r.data });
        } else {
            // Create Record
            const r = await gsCall("records.add", {
                restaurant_name: s(pick(body, ["restaurant_name", "restaurant"])),
                reservation_no: s(pick(body, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id"])),
                date: normalizeDate(pick(body, ["date", "gun_ay_yil"])),
                time: normalizeTime(pick(body, ["time", "saat"])),
                customer_full_name: s(pick(body, ["full_name", "customer_full_name", "guest_full_name"])),
                customer_phone: s(pick(body, ["phone", "customer_phone", "guest_phone"])),
                table_no: s(pick(body, ["table_no", "table_n0", "masa_no", "tableNumber"])),
                kids_u7: s(pick(body, ["child_u7", "kids_u7", "children_u7", "cocuk_7_alti"])),
                note: s(pick(body, ["note", "blacklist_note", "customer_note"])) || "",
                status: s(pick(body, ["status"])) || "active",
                risk_level: s(pick(body, ["risk_level", "risk", "riskLevel"])) || "",
                authorized_name: s(pick(body, ["authorized_name", "officer_name", "added_by_name"])),
            });
            if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
            return NextResponse.json({ ok: true });
        }
    }

    // REQUESTS
    if (route === "requests") {
        if (subAction === "respond") {
            // Respond to Request
            await requireRole(["manager"]);
            const request_id = s(body.request_id);
            if (!request_id) return NextResponse.json({ error: "missing request_id" }, { status: 400 });
            const manager_response = s(body.manager_response ?? body.response_text ?? body.manager_response_text ?? "");
            if (!manager_response) return NextResponse.json({ error: "missing manager_response" }, { status: 400 });

            const r = await gsCall("requests.respond", {
                request_id, status: normStatus(body.status), manager_response,
                manager_response_text: manager_response, response_text: manager_response,
            });
            if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
            return NextResponse.json({ ok: true });
        } else {
            // Create Request
            const r = await gsCall("requests.add", {
                subject_person_name: body.subject_person_name || body.guest_full_name || body.full_name || "",
                subject_phone: body.subject_phone || body.guest_phone || body.phone || "",
                reason: body.reason || body.summary || body.note || "",
            });
            if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
            return NextResponse.json({ ok: true, request_id: r.data });
        }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function handleGet(req: NextRequest, route: string) {
    if (route === "reservations") {
        const r = await gsCall<any>("reservations.list", {});
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        const rows = pickRowsFromGsResult(r);
        return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
    }
    if (route === "records") {
        const r = await gsCall<any[]>("records.list", {});
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        const rows = Array.isArray(r.data) ? r.data : [];
        return NextResponse.json({ rows: rows.map(normalizeRecordRow) });
    }
    if (route === "requests") {
        const r = await gsCall<any[]>("requests.list", {});
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        const rows = Array.isArray(r.data) ? r.data : [];
        return NextResponse.json({ rows: rows.map(normalizeRequestRow) });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function handlePut(req: NextRequest, route: string) {
    const body = await req.json().catch(() => ({}));
    if (route === "records") {
        const record_id = s(pick(body, ["record_id", "id"]));
        if (!record_id) return NextResponse.json({ error: "missing record_id" }, { status: 400 });

        const patch: any = {
            restaurant_name: pick(body, ["restaurant_name", "restaurant"]) || undefined,
            reservation_no: pick(body, ["reservation_no", "reservation_n0", "reservationNumber"]) || undefined,
            date: normalizeDate(pick(body, ["date", "gun_ay_yil"])) || undefined,
            time: normalizeTime(pick(body, ["time", "saat"])) || undefined,
            customer_full_name: pick(body, ["full_name", "customer_full_name", "guest_full_name"]) || undefined,
            customer_phone: pick(body, ["phone", "customer_phone", "guest_phone"]) || undefined,
            table_no: pick(body, ["table_no", "table_n0", "masa_no"]) || undefined,
            kids_u7: pick(body, ["child_u7", "kids_u7", "children_u7"]) || undefined,
            note: pick(body, ["note", "blacklist_note", "customer_note"]) || undefined,
            status: pick(body, ["status"]) || undefined,
            risk_level: pick(body, ["risk_level", "risk", "riskLevel"]) || undefined,
            authorized_name: pick(body, ["authorized_name", "officer_name"]) || undefined,
        };
        const r = await gsCall("records.update", { record_id, ...patch });
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function handleDelete(req: NextRequest, route: string) {
    const body = await req.json().catch(() => ({}));
    if (route === "records") {
        const record_id = s(pick(body, ["record_id", "id"]));
        if (!record_id) return NextResponse.json({ error: "missing record_id" }, { status: 400 });
        const r = await gsCall("records.delete", { record_id });
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// --- Dispatcher ---

export async function GET(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const { action } = await params;
        if (!action || action.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return handleGet(req, action[0]);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Server Error" }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const { action } = await params;
        if (!action || action.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return handlePost(req, action[0], action[1]);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Server Error" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const { action } = await params;
        if (!action || action.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return handlePut(req, action[0]);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Server Error" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const { action } = await params;
        if (!action || action.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return handleDelete(req, action[0]);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Server Error" }, { status: 500 }); }
}
