<?php
/**
 * North Health GPT — dependency-free repository validation.
 * Run from repository root: php tests/validate_repository.php
 */

declare(strict_types=1);

$root = realpath(__DIR__ . '/..');
if ($root === false) {
    fwrite(STDERR, "FAIL: repository root not found.\n");
    exit(1);
}

$errors = [];
$checks = [];

function check(bool $condition, string $message): void {
    global $checks, $errors;
    if ($condition) {
        $checks[] = "PASS: {$message}";
    } else {
        $errors[] = "FAIL: {$message}";
    }
}

$requiredFiles = [
    'README.md',
    'LICENSE',
    '.gitignore',
    'northgpt/index.html',
    'northgpt/api/config.example.php',
    'northgpt/api/token.php',
    'northgpt/api/chat.php',
    'northgpt/api/leda_prompt.txt',
    'northgpt/js/app.js',
    'northgpt/js/live-voice.js',
    'schema/referral-database.json',
    'docs/ARCHITECTURE.md',
    'docs/HEALTH-LOGIC.md',
    'docs/DATA-FLOW.md',
    'docs/ROADMAP.md',
    'docs/API-SECURITY.md',
    'docs/TESTING.md',
    'docs/MODEL-STRATEGY.md',
    'docs/screenshots/01-voice-opening.png',
    'docs/screenshots/02-main-interface.png',
];

foreach ($requiredFiles as $file) {
    check(is_file($root . DIRECTORY_SEPARATOR . $file), "required file exists: {$file}");
}

$gitignore = @file_get_contents($root . '/.gitignore') ?: '';
check(str_contains($gitignore, 'northgpt/api/config.php'), 'config.php is excluded by .gitignore');
check(!is_file($root . '/northgpt/api/config.php'), 'live config.php is not present in the repository');

$configExample = @file_get_contents($root . '/northgpt/api/config.example.php') ?: '';
check(str_contains($configExample, 'YOUR_GEMINI_LIVE_API_KEY_HERE'), 'voice API configuration uses a placeholder');
check(str_contains($configExample, 'YOUR_GEMINI_API_KEY_HERE'), 'text API configuration uses a placeholder');

$readme = @file_get_contents($root . '/README.md') ?: '';
check(str_contains($readme, 'https://www.kanaltech.site/'), 'current prototype URL is documented');
check(!str_contains($readme, 'kanaltech.sungridvolt.com'), 'legacy testing URL is absent from README');

$allTextFiles = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
foreach ($iterator as $file) {
    if (!$file->isFile()) continue;
    $path = $file->getPathname();
    $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
    if (str_contains($rel, 'tests' . DIRECTORY_SEPARATOR)) continue;
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (in_array($ext, ['md','php','js','html','css','txt','json'], true)) {
        $allTextFiles[$rel] = @file_get_contents($path) ?: '';
    }
}

$secretPatterns = [
    '/AIza[0-9A-Za-z_-]{20,}/',
    '/sk-ant-[0-9A-Za-z_-]{20,}/',
    '/sk-[0-9A-Za-z_-]{24,}/',
    '/Bearer\s+[A-Za-z0-9._-]{20,}/i',
];

foreach ($allTextFiles as $rel => $text) {
    if ($rel === 'northgpt/api/config.example.php') continue;
    foreach ($secretPatterns as $pattern) {
        check(preg_match($pattern, $text) !== 1, "no obvious live credential pattern in {$rel}");
    }
    check(!str_contains($text, 'kanaltech.sungridvolt.com'), "legacy testing URL absent from {$rel}");
}

$json = @file_get_contents($root . '/schema/referral-database.json');
$data = json_decode($json ?: '', true);
check(json_last_error() === JSON_ERROR_NONE && is_array($data), 'referral database is valid JSON');
check(isset($data['_meta']['prototype_data_notice']), 'referral database contains prototype-data safety notice');
check(isset($data['sample_facilities']) && is_array($data['sample_facilities']) && count($data['sample_facilities']) >= 3, 'referral schema contains at least three sample records');

foreach ($checks as $line) echo $line . PHP_EOL;
if ($errors) {
    foreach ($errors as $line) fwrite(STDERR, $line . PHP_EOL);
    fwrite(STDERR, sprintf("\nValidation failed: %d check(s).\n", count($errors)));
    exit(1);
}

echo sprintf("\nValidation passed: %d checks.\n", count($checks));
exit(0);
