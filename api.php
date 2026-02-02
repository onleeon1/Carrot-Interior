<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$db_file = __DIR__ . '/data.json';
$upload_dir = __DIR__ . '/uploads';

// 업로드 디렉토리 생성 및 권한 확인
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/**
 * Base64 이미지를 파일로 저장하고 고유한 경로를 반환하는 함수
 * 같은 이름의 파일이 업로드되어도 충돌하지 않도록 파일명을 재생성합니다.
 */
function saveBase64Image($base64_string, $upload_dir) {
    if (preg_match('/^data:image\/(\w+);base64,/', $base64_string, $type)) {
        $data = substr($base64_string, strpos($base64_string, ',') + 1);
        $type = strtolower($type[1]); // jpg, png, webp...

        if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
            return $base64_string; 
        }

        $data = base64_decode($data);
        if ($data === false) return $base64_string;

        // 파일 이름 고유화: 날짜_시간_랜덤문자열 조합
        // 동일한 파일명을 가진 파일을 올려도 서버에서는 각각 다른 이름으로 저장됩니다.
        try {
            $random_suffix = bin2hex(random_bytes(4));
        } catch (Exception $e) {
            $random_suffix = substr(md5(uniqid()), 0, 8);
        }
        
        $file_name = 'img_' . date('Ymd_His') . '_' . $random_suffix . '.' . $type;
        $file_path = $upload_dir . '/' . $file_name;
        
        if (file_put_contents($file_path, $data)) {
            // 외부에서 접근 가능한 상대 경로 반환
            return 'uploads/' . $file_name;
        }
    }
    return $base64_string;
}

// GET: 데이터 읽기
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($db_file)) {
        if (!is_writable(__DIR__)) {
            http_response_code(500);
            echo json_encode(['error' => 'Server directory is not writable.']);
            exit;
        }
        $initial = json_encode(['projects' => [], 'inquiries' => []], JSON_UNESCAPED_UNICODE);
        file_put_contents($db_file, $initial);
        echo $initial;
    } else {
        $content = file_get_contents($db_file);
        if (trim($content) === "" || $content === "null") {
            echo json_encode(['projects' => [], 'inquiries' => []], JSON_UNESCAPED_UNICODE);
        } else {
            echo $content;
        }
    }
    exit;
}

// POST: 데이터 저장 및 이미지 파일화 추출
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        // 모든 프로젝트를 순회하며 새로 추가된 Base64 이미지를 실제 파일로 변환
        if (isset($decoded['projects']) && is_array($decoded['projects'])) {
            foreach ($decoded['projects'] as &$project) {
                // 메인 이미지 처리
                if (isset($project['mainImage']) && strpos($project['mainImage'], 'data:image') === 0) {
                    $project['mainImage'] = saveBase64Image($project['mainImage'], $upload_dir);
                }
                
                // 갤러리 이미지 처리
                if (isset($project['gallery']) && is_array($project['gallery'])) {
                    foreach ($project['gallery'] as &$img) {
                        if (strpos($img, 'data:image') === 0) {
                            $img = saveBase64Image($img, $upload_dir);
                        }
                    }
                }
            }
        }
        
        // 파일 경로만 포함된 가벼운 JSON 생성
        $final_json = json_encode($decoded, JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($db_file, $final_json, LOCK_EX)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save data.json']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    }
    exit;
}
?>