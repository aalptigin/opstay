import { NextResponse } from "next/server";

// Form validation schema
interface ContactFormData {
    businessName: string;
    contactName: string;
    phone: string;
    email: string;
    packageType: "basic" | "premium" | "enterprise";
    requestType: "demo" | "offer";
}

// Basit validation fonksiyonu
function validateFormData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.businessName || data.businessName.length < 2) {
        errors.push("İşletme adı en az 2 karakter olmalıdır");
    }

    if (!data.contactName || data.contactName.length < 2) {
        errors.push("Yetkili adı en az 2 karakter olmalıdır");
    }

    if (!data.phone || !/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ""))) {
        errors.push("Geçerli bir telefon numarası giriniz");
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Geçerli bir e-posta adresi giriniz");
    }

    if (!["basic", "premium", "enterprise"].includes(data.packageType)) {
        errors.push("Geçerli bir paket tipi seçiniz");
    }

    if (!["demo", "offer"].includes(data.requestType)) {
        errors.push("Geçerli bir talep tipi seçiniz");
    }

    return { valid: errors.length === 0, errors };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate form data
        const validation = validateFormData(body);

        if (!validation.valid) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.errors },
                { status: 400 }
            );
        }

        const formData: ContactFormData = body;

        // Google Apps Script URL'iniz varsa buraya ekleyin
        // Şimdilik console'a log atıyoruz
        console.log("Pricing Contact Form Submission:", {
            businessName: formData.businessName,
            contactName: formData.contactName,
            phone: formData.phone,
            email: formData.email,
            packageType: formData.packageType,
            requestType: formData.requestType,
            timestamp: new Date().toISOString(),
        });

        // TODO: Google Apps Script'e veya email servisine gönderme
        // Örnek Google Apps Script entegrasyonu:
        /*
        const scriptUrl = process.env.PRICING_CONTACT_SCRIPT_URL;
        if (scriptUrl) {
          await fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "pricing_contact_add",
              ...formData,
            }),
          });
        }
        */

        return NextResponse.json(
            {
                success: true,
                message: "Talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz."
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Pricing contact form error:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}
