<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$db_file = __DIR__ . '/data.json';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// GET: 데이터 읽기
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($db_file)) {
        // 파일이 없으면 디렉토리 쓰기 권한 확인 후 생성
        if (!is_writable(__DIR__)) {
            http_response_code(500);
            echo json_encode(['error' => 'Server directory is not writable. Please check permissions.']);
            exit;
        }
        $initial = json_encode(['projects' => [], 'inquiries' => []], JSON_UNESCAPED_UNICODE);
        file_put_contents($db_file, $initial);
        echo $initial;
    } else {
        $content = file_get_contents($db_file);
        // 비어있는 파일 방어
        if (trim($content) === "" || $content === "null") {
            echo json_encode(['projects' => [], 'inquiries' => []], JSON_UNESCAPED_UNICODE);
        } else {
            echo $content;
        }
    }
    exit;
}

// POST: 데이터 쓰기
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        if (file_put_contents($db_file, $input, LOCK_EX)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to write to data.json. Check file permissions.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data received.']);
    }
    exit;
}
?>