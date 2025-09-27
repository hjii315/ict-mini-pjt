# ict-mini-pjt (Meeting Place App)

모임 구성원들의 출발지를 기준으로 공평한 중간지점을 계산하고, 해당 반경 내 맛집을 추천해 주는 웹 애플리케이션입니다. 프론트엔드는 Next.js(React, TypeScript), 백엔드는 FastAPI 기반의 MCP 서버를 사용합니다. 또한 단순한 영수증 금액 나눔/정산 예제(Flask)와 영수증 OCR 분석(Clova OCR 연동 예시)가 포함되어 있습니다.

## 주요 기능
- 참석자 출발지 입력 및 반경/선호 음식 선택 ([frontend/components/meeting-place-app.tsx](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/frontend/components/meeting-place-app.tsx:0:0-0:0))
- 중간지점 계산 및 주변 맛집 추천 ([backend/server.py](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/backend/server.py:0:0-0:0))
- 추천 결과 목록/지도 표시 ([frontend/components/search-results.tsx](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/frontend/components/search-results.tsx:0:0-0:0))
- 1/N 정산 계산 UI ([frontend/components/bill-calculator.tsx](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/frontend/components/bill-calculator.tsx:0:0-0:0))
- (샘플) 영수증 OCR 분석 API ([app.py](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/app.py:0:0-0:0))

## 폴더 구조
ict-mini-pjt/ ├─ app.py # (Flask 샘플) 영수증 계산/Clova OCR 분석 엔드포인트 ├─ backend/ │ ├─ server.py # FastAPI MCP 서버 (추천 API) │ ├─ config.py # 서버/캐시/API키 설정 │ ├─ common/ # 검증/스키마/지오코딩/캐시 유틸 모듈 │ ├─ logs/ │ └─ README.md ├─ frontend/ │ ├─ app/ │ │ └─ page.tsx # 홈: MeetingPlaceApp 렌더링 │ ├─ components/ │ │ ├─ meeting-place-app.tsx # 참석자 입력/검색 옵션/검색 수행 │ │ ├─ search-results.tsx # (분할 대상) 추천 결과 페이지 컴포넌트(목록+지도) │ │ ├─ bill-calculator.tsx # 정산 계산 UI │ │ ├─ step-navigation.tsx # 단계 네비게이션 UI │ │ ├─ loading-states.tsx # 로딩/에러/빈 상태 UI │ │ ├─ map/ # (비어있음) 지도 관련 컴포넌트 예정 │ │ └─ restaurant/ # (비어있음) 식당 리스트/카드 컴포넌트 예정 │ ├─ services/ │ │ └─ api.ts # 백엔드 API 연동 (MCP /health, /mcp/tools, /mcp/call 등) │ ├─ styles/, public/, ui/ │ └─ next.config.mjs, tsconfig.json, package.json 등 ├─ templates/, static/ # Flask 샘플용 템플릿/정적 리소스 ├─ requirements.txt # 백엔드 파이썬 의존성 └─ README.md


## 빠른 시작

### 사전 요구사항
- Node.js 18+ (또는 20+ 권장), pnpm 또는 npm
- Python 3.10+

### 백엔드(FastAPI, MCP 서버) 실행
1. 환경변수(.env) 또는 [backend/config.py](cci:7://file:///d:/%EC%9E%A5%EC%A7%84/ict_mini-pjt/ict-mini-pjt/backend/config.py:0:0-0:0) 설정 준비
   - 배포 시에는 민감한 키를 코드에 직접 두지 말고 환경변수로 주입하세요.
2. 서버 실행
   ```bash
   cd backend
   # 가상환경 권장 (예: python -m venv .venv && source .venv/bin/activate)
   pip install -r ../requirements.txt
   python server.py  # 또는: uvicorn server:app --host 0.0.0.0 --port 9000

3. 헬스체크
GET http://localhost:9000/health → {"status":"healthy","service":"meetup"}

