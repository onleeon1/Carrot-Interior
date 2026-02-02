
# 🥕 당근 인테리어 - GitHub Pages CMS

깃허브 페이지(GitHub Pages)의 정적 호스팅 환경에서도 시공 사례를 자유롭게 올리고 관리할 수 있는 **Serverless CMS**입니다.

## 🚀 깃허브 배포 및 사용법

본 프로젝트는 PHP 없이 **GitHub API**를 사용하여 브라우저에서 직접 소스 코드를 업데이트합니다.

### 1. 깃허브 저장소 생성 및 코드 업로드
- 이 프로젝트의 모든 파일(`index.html`, `index.tsx`, `data.json` 등)을 자신의 GitHub 저장소에 올립니다.
- 저장소 설정(Settings > Pages)에서 **GitHub Pages**를 활성화합니다.

### 2. GitHub Personal Access Token 발급
- [GitHub Settings > Developer Settings > Personal Access Tokens (Classic)](https://github.com/settings/tokens)로 이동합니다.
- `Generate new token`을 클릭하고 **'repo'** 권한을 체크하여 토큰을 생성합니다. (생성된 토큰은 한 번만 보여지니 꼭 복사해두세요!)

### 3. 관리자 페이지 설정
- 자신의 웹사이트 주소로 접속한 뒤 **[관리자 모드]** 버튼을 누릅니다. (비밀번호: `catcat123`)
- **[GitHub 설정]** 탭에서 `Owner(아이디)`, `Repo(저장소명)`, `Token`을 입력합니다.
- 이제 포트폴리오를 수정하거나 새 글을 작성한 뒤 **[GitHub에 배포]**를 누르면 끝!

### 4. 주의사항
- **반영 속도**: 수정한 내용은 GitHub 저장소에 즉시 커밋되지만, 실제 웹사이트에 반영되기까지는 GitHub Actions 빌드 시간(약 1~2분)이 소요됩니다.
- **이미지**: 업로드한 이미지는 Base64 형태로 `data.json`에 저장되거나 향후 깃허브 API를 통해 개별 파일로 분리될 수 있습니다.

## ✨ 기술적 특징
- **No Backend**: PHP나 DB 서버가 전혀 필요 없습니다.
- **Auto Sync**: 브라우저에서 수정하면 깃허브 저장소에 자동으로 반영됩니다.
- **Security**: 중요한 토큰 정보는 사용자 브라우저의 `localStorage`에만 안전하게 보관됩니다.
