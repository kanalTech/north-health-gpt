<?php
/**
 * North Health GPT — Central Configuration
 *
 * Text mode:
 *   Gemini 3.7 Flash
 *   High thinking effort
 *
 * Voice mode:
 *   Gemini 3.1 Flash Live Preview
 *   Leda voice
 *   High thinking effort
 *
 * Keep this file private.
 * Recommended permissions: 600
 */

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | TEXT MODE — Health Logic
    |--------------------------------------------------------------------------
    |
    | Used by your normal text-chat endpoint.
    |
    */

    'gemini_api_key' => 'YOUR_GEMINI_API_KEY_HERE',

    'gemini_model' => 'gemini-3.7-flash',

    'gemini_thinking_level' => 'LOW',

    /*
    |--------------------------------------------------------------------------
    | VOICE MODE — Gemini Live
    |--------------------------------------------------------------------------
    |
    | Used by api/token.php to create the short-lived Live token.
    | Never expose this key to JavaScript.
    |
    */

    'live_api_key' => 'YOUR_GEMINI_LIVE_API_KEY_HERE',

    'live_model' => 'gemini-3.1-flash-live-preview',

    'live_voice' => 'Leda',

    'live_thinking_level' => 'MEDIUM',

    /*
    |--------------------------------------------------------------------------
    | Hausa prompt location
    |--------------------------------------------------------------------------
    |
    | The prompt is intentionally NOT stored here.
    | token.php loads it from:
    |
    | public_html/northgpt/api/leda_prompt.txt
    |
    */

    'live_prompt_file' => __DIR__ . '/leda_prompt.txt',

    /*
    |--------------------------------------------------------------------------
    | Live audio activity detection
    |--------------------------------------------------------------------------
    |
    | Hausa speakers may pause while thinking.
    |
    */

    'vad_silence_ms' => 500,

    'vad_prefix_padding_ms' => 300,

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */

    'keepalive_secret' =>
        'REPLACE_WITH_A_LONG_RANDOM_SECRET_64_CHARACTERS_OR_MORE',

    /*
    |--------------------------------------------------------------------------
    | Default map location
    |--------------------------------------------------------------------------
    */

    'kano_lat' => 11.9626,

    'kano_lng' => 8.5519,

    /*
    |--------------------------------------------------------------------------
    | Verified Kano hospital referrals
    |--------------------------------------------------------------------------
    */

    'hospitals' => [

        'maternal' => [
            'name' => 'Murtala Muhammad Specialist Hospital, Kano',
            'q' => 'Murtala Muhammad Specialist Hospital Kano',
        ],

        'newborn' => [
            'name' => 'Hasiya Bayero Pediatric Hospital, Kano',
            'q' => 'Hasiya Bayero Pediatric Hospital Kano',
        ],

        'infectious' => [
            'name' => 'Kano Infectious Diseases Hospital, Kano',
            'q' => 'Infectious Diseases Hospital Kano',
        ],

        'malnutrition' => [
            'name' => 'Hasiya Bayero Pediatric Hospital, Kano',
            'q' => 'Hasiya Bayero Pediatric Hospital Kano',
        ],

        'tuberculosis' => [
            'name' => 'Zana Hospital (Kano Infectious Diseases Hospital), Kano',
            'q' => 'Zana Hospital France Road Kano',
        ],

        'general' => [
            'name' => 'Aminu Kano Teaching Hospital (AKTH)',
            'q' => 'Aminu Kano Teaching Hospital Zaria Road Kano',
        ],
    ],
];