<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed.'
    ]);
    exit;
}

$configFile = __DIR__ . '/config.php';

if (!is_readable($configFile)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Configuration file is missing.'
    ]);
    exit;
}

$config = require $configFile;

$apiKey = trim((string)($config['live_api_key'] ?? ''));

$liveModel = trim((string)(
    $config['live_model']
    ?? 'gemini-3.1-flash-live-preview'
));

$voice = trim((string)(
    $config['live_voice']
    ?? 'Leda'
));

$thinkingLevel = strtoupper(trim((string)(
    $config['live_thinking_level']
    ?? 'HIGH'
)));

$promptFile = $config['live_prompt_file']
    ?? (__DIR__ . '/leda_prompt.txt');

if (!is_readable($promptFile)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'leda_prompt.txt is missing.'
    ]);
    exit;
}

$systemPrompt = trim((string)file_get_contents($promptFile));

if ($systemPrompt === '') {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'leda_prompt.txt is empty.'
    ]);
    exit;
}

if ($apiKey === '' ||
    str_contains($apiKey, 'PASTE_') ||
    str_contains($apiKey, 'YOUR_') ||
    str_contains($apiKey, 'REPLACE_')) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Live API key is not configured.'
    ]);
    exit;
}

$generationConfig = [
    'responseModalities' => ['AUDIO'],
    'speechConfig' => [
        'voiceConfig' => [
            'prebuiltVoiceConfig' => [
                'voiceName' => $voice
            ]
        ]
    ]
];

$allowedThinkingLevels = [
    'MINIMAL',
    'LOW',
    'MEDIUM',
    'HIGH'
];

if (in_array($thinkingLevel, $allowedThinkingLevels, true)) {
    $generationConfig['thinkingConfig'] = [
        'thinkingLevel' => $thinkingLevel
    ];
}

$payload = [
    'uses' => 1,
    'bidiGenerateContentSetup' => [
        'model' => 'models/' . $liveModel,
        'generationConfig' => $generationConfig,
        'systemInstruction' => [
            'parts' => [
                [
                    'text' => $systemPrompt
                ]
            ]
        ]
    ]
];

$jsonPayload = json_encode(
    $payload,
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES |
    JSON_THROW_ON_ERROR
);

$url = 'https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=' . urlencode($apiKey);

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $jsonPayload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey
    ],
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 25
]);

$responseBody = curl_exec($ch);
$statusCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

if ($responseBody === false ||
    $statusCode < 200 ||
    $statusCode >= 300) {
    error_log(
        '[NorthGPT] Gemini token error HTTP ' .
        $statusCode .
        ' ' .
        $curlError .
        ' ' .
        substr((string)$responseBody, 0, 500)
    );

    http_response_code(502);

    echo json_encode([
        'status' => 'error',
        'message' => 'Muryar baya kan aiki yanzu. Yi amfani da rubutu.'
    ]);

    exit;
}

$data = json_decode((string)$responseBody, true);

$tokenName = trim((string)($data['name'] ?? ''));

if ($tokenName === '') {
    http_response_code(502);

    echo json_encode([
        'status' => 'error',
        'message' => 'Gemini did not return a Live token.'
    ]);

    exit;
}

echo json_encode([
    'status' => 'success',
    'token' => $tokenName,
    'model' => $liveModel
], JSON_UNESCAPED_UNICODE);