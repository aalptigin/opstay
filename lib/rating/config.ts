/**
 * Rating Configuration
 * Restaurant-specific settings for rating system
 */

export type RatingConfig = {
    googleReviewUrl: string;
    surveyUrl?: string;
};

export const RATING_CONFIG: Record<string, RatingConfig> = {
    "Happy Moons": {
        googleReviewUrl: "https://g.page/r/YOUR_HAPPY_MOONS_REVIEW_LINK/review",
        surveyUrl: "https://forms.gle/YOUR_HAPPY_MOONS_SURVEY",
    },
    "happy moons": {
        googleReviewUrl: "https://g.page/r/YOUR_HAPPY_MOONS_REVIEW_LINK/review",
        surveyUrl: "https://forms.gle/YOUR_HAPPY_MOONS_SURVEY",
    },
    Roof: {
        googleReviewUrl: "https://g.page/r/YOUR_ROOF_REVIEW_LINK/review",
        surveyUrl: "https://forms.gle/YOUR_ROOF_SURVEY",
    },
    roof: {
        googleReviewUrl: "https://g.page/r/YOUR_ROOF_REVIEW_LINK/review",
        surveyUrl: "https://forms.gle/YOUR_ROOF_SURVEY",
    },
};

/**
 * Get rating config by restaurant name
 */
export function getRatingConfig(restaurant: string): RatingConfig | null {
    const trimmed = (restaurant || "").trim();
    return RATING_CONFIG[trimmed] || null;
}

/**
 * SMS Templates for rating system
 */
export const SMS_TEMPLATES = {
    /**
     * Initial rating request after checkout
     */
    ratingRequest: (params: { ratingLink: string; restaurantName: string }) => `
Degerli musteri,
Bizi tercih ettiginiz icin tesekkur ederiz!
Deneyiminizi puanlar misiniz?
${params.ratingLink}
${params.restaurantName}
`.trim(),

    /**
     * Thank you SMS for positive ratings (4-5 stars)
     */
    positiveThankYou: (params: {
        googleReviewUrl: string;
        surveyUrl?: string;
        restaurantName: string;
    }) => {
        let msg = `
Olumlu degerlendirmeniz icin cok tesekkurler!
Bizi Google'da da degerlendirirseniz mutlu oluruz:
${params.googleReviewUrl}
`.trim();

        if (params.surveyUrl) {
            msg += `\nKisa anketimize de katilabilirsiniz:\n${params.surveyUrl}`;
        }

        msg += `\n${params.restaurantName}`;
        return msg;
    },
};
