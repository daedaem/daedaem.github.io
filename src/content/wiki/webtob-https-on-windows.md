---
draft: false
title: 'WebtoB(Windows)에 사설 인증서로 HTTPS 적용하는 절차'
description: '자체 서명 인증서로 설정·포트·접속을 먼저 확인하고 정식 인증서로 바꾸는 순서. OpenSSL 명령, http.m 설정, 접속 시험, HTTP에서 HTTPS로 넘어가는 순서를 정리한다.'
topic: 'infra'
tags: ['WebtoB', 'HTTPS', 'TLS', 'OpenSSL', 'Windows Server']
created: 2026-10-26
updated: 2026-11-13
status: 'stable'
---

**한 줄 요약.** 정식 인증서를 기다리지 않고 **자체 서명 인증서로 설정·포트·접속 경로를 먼저 확인**한다. 여기까지 되면 정식 인증서는 파일만 바꾸면 되고, 문제가 생겨도 볼 범위가 인증서로 좁혀진다. 실제로 겪은 사례는 [WebtoB가 기동 중에 멈췄다](/posts/webtob-boot0012-encrypted-private-key/)에 있다.

> 도메인·IP·포트·경로·계정은 모두 예시 값이다. `example.com`과 `192.0.2.x`는 문서 예시용으로 예약된 값이다. WebtoB는 버전에 따라 설정 항목과 지원하는 TLS 버전이 다르므로 쓰는 버전의 매뉴얼과 대조한다.

## 예시 값

| 항목 | 예시 값 |
| --- | --- |
| 접속 도메인 | `app.example.com` |
| 기존 HTTP 포트 / 새 HTTPS 포트 | `8080` / `8443` |
| 서버 1, 서버 2 IP | `192.0.2.11`, `192.0.2.12` |
| WebtoB 설치 경로 / 인증서 폴더 | `C:\WebtoB` / `C:\WebtoB\ssl` |
| 관리 PC 작업 폴더 | `C:\work\cert` |

## 먼저 정하는 것

- HTTPS의 목적은 접속 차단이 아니라 통신 암호화와 서버 확인이다. 누가 접속할 수 있는지는 기존처럼 네트워크, 방화벽, 로그인이 정한다.
- 기존 HTTP는 바로 끄지 않는다. HTTPS를 추가해서 확인한 뒤 마지막에 전환한다.
- 서버는 한 대씩 작업하고, 단계마다 백업과 원복 방법을 준비한다.

## 파일 종류

| 파일 | 내용 | 공개 여부 | 두는 곳 |
| --- | --- | --- | --- |
| `server.crt` | 서버 인증서 (도메인 + 공개키 + 발급기관 서명) | 공개 | 서버 |
| `server.key` | 서버 개인키 | 비밀 | 서버 |
| `chain.pem` | 중간 CA 인증서 | 공개 | 서버 |
| 루트 CA 인증서 | 체인 맨 위의 CA 인증서 | 공개 | 사용자 PC 신뢰 저장소 |
| `server.csr` | 인증서 발급 신청서 | 공개 | CA에 제출 |
| `.pfx` / `.p12` | 인증서 + 개인키를 비밀번호로 묶은 파일 | 비밀 | 변환 후 보관·폐기 |

공개키는 따로 챙길 파일이 없다. 개인키를 만들 때 짝으로 생기고 CSR과 인증서 안에 들어간다. 확장자보다 내용이 중요하며, `-----BEGIN ...`으로 시작하는 텍스트면 PEM이다. 개인키는 상대에게 보내는 것이 아니라 서버 안에서 서명하는 데만 쓴다.

브라우저는 아래 순서로 확인하고, 한 칸이라도 실패하면 경고를 띄운다. 서버가 정상이어도 PC 쪽 문제로 경고가 날 수 있다.

```txt
서버 인증서 → 서명 확인 → 중간 CA
중간 CA     → 서명 확인 → 루트 CA
루트 CA     → 내 PC 신뢰 목록에 있나?
+ 접속 이름이 SAN에 있나? 유효기간이 맞나?
```

## OpenSSL은 관리 PC에서 실행한다

운영 서버에 새 프로그램을 설치하면 PATH, DLL, 환경변수가 바뀌어 기존 서비스에 영향을 줄 수 있다. 인증서 파일은 어디서 만들든 결과가 같으므로 관리 PC에서 만들고 결과 파일만 서버로 옮긴다. 개인키를 다른 장비에서 만들어 옮겨도 되는지는 조직의 보안 정책을 먼저 확인한다.

```powershell
$OpenSSL = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
Test-Path $OpenSSL        # True 여야 한다
& $OpenSSL version
```

## 자체 서명 인증서 만들기

```powershell
New-Item -ItemType Directory -Path "C:\work\cert" -Force
Set-Location "C:\work\cert"

& $OpenSSL req -x509 -newkey rsa:2048 -sha256 -days 30 -nodes `
  -keyout server.key -out server.crt `
  -subj "/CN=app.example.com" `
  -addext "subjectAltName=DNS:app.example.com" `
  -addext "basicConstraints=critical,CA:FALSE" `
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" `
  -addext "extendedKeyUsage=serverAuth"

# SAN에 도메인이 있는지, Subject와 Issuer가 같은지 확인
& $OpenSSL x509 -in server.crt -noout -subject -issuer -dates -ext subjectAltName
```

| 옵션 | 의미 |
| --- | --- |
| `-x509` | CSR 없이 자체 서명 인증서를 바로 생성 |
| `-days 30` | 유효기간. 테스트용은 짧게 |
| `-nodes` | 개인키를 암호화하지 않음. OpenSSL 3.x의 새 이름은 `-noenc` |
| `-addext subjectAltName` | 인증서가 유효한 접속 이름 |

인증서 이름에는 URL 전체가 아니라 도메인만 넣는다. 접속 주소가 `http://app.example.com:8080/app/`이면 `app.example.com`만 넣는다.

## WebtoB에 HTTPS 추가

서버에서 쓸 포트가 비어 있는지 보고, 설정을 통째로 백업한다. 설정 원본(.m)뿐 아니라 컴파일 결과와 기존 인증서 폴더도 같이 백업한다.

```powershell
# 결과가 없어야 한다
Get-NetTCPConnection -State Listen -LocalPort 8443 -ErrorAction SilentlyContinue

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
Copy-Item "C:\WebtoB\config" "C:\WebtoB\config_backup_$ts" -Recurse
```

인증서와 개인키는 서버의 `C:\WebtoB\ssl`에 둔다. 설정에 적는 경로는 서버 기준 경로다. 웹 문서 경로(DOCROOT) 안에는 두지 않는다.

`http.m`에는 기존 HTTP 설정을 그대로 두고 아래를 추가한다.

```txt
*VHOST
vhost_https
    HOSTNAME = "app.example.com",
    DOCROOT  = "<기존 HTTP 가상호스트와 동일>",
    PORT     = "8443",
    SSLFLAG  = Y,
    SSLNAME  = "ssl_app"

*SSL
ssl_app
    CertificateFile    = "C:/WebtoB/ssl/server.crt",
    CertificateKeyFile = "C:/WebtoB/ssl/server.key",
    Protocols          = "-TLSv1, -TLSv1.1, TLSv1.2"
```

- 기존 `*SVRGROUP`, `*URI` 등에 `VhostName` 제한이 있으면 HTTPS 가상호스트 이름도 추가해야 업무 화면이 연결된다.
- `*NODE`에 `Listen`이 있으면 `Port`보다 우선한다.
- `Protocols` 표기법은 버전마다 다를 수 있다. 위 표기는 예시다. TLS 1.0과 1.1은 켜지 않는다.
- HTTPS 포트가 꼭 443일 필요는 없다. 반대로 방화벽만 열었다고 HTTPS가 되지는 않는다.

```shell
cd /d C:\WebtoB\config
wscfl -i http.m
```

컴파일이 오류 없이 끝나야 재기동한다. 컴파일 성공, 기동 성공, 접속 성공은 각각 따로 확인한다.

### HTTPS 접속 로그를 따로 둔다

HTTPS 가상호스트에 별도 접속 로그를 붙여 두면, 그 파일에 한 줄이라도 찍히는 순간 요청이 TLS를 통과해 WebtoB까지 왔다는 뜻이 된다. 접속 시험과 전환 때 모두 쓴다.

```txt
*LOGGING
log_https_acc
    Format   = "DEFAULT",
    FileName = "C:/WebtoB/log/access_https_%Y%%M%%D%.log",
    Option   = "sync"
```

## 접속 시험

L4를 거치지 않고 서버마다 직접 접속한다.

```powershell
curl.exe -vk --noproxy "*" `
  --resolve "app.example.com:8443:192.0.2.11" `
  "https://app.example.com:8443/app/" -o NUL
```

PowerShell 5.1에서는 반드시 `curl.exe`로 입력한다. `curl`은 `Invoke-WebRequest`의 별칭이다. `--resolve`는 도메인은 그대로 두고 연결할 IP만 바꾼다. `-k`는 인증서 검증을 건너뛰는 진단용이라, `-k`로 된다고 신뢰 문제가 해결된 것은 아니다.

| 결과 | 다음에 볼 것 |
| --- | --- |
| 200, 302 같은 HTTP 응답 | HTTPS 연결은 됐다. 브라우저와 업무 화면 확인 |
| 404 | `VhostName`, URI 매핑 누락 |
| 503 | WAS 연결 상태 |
| handshake / SSL 오류 | WebtoB SSL 설정, 인증서, 로그 |
| Connection refused | 해당 포트가 LISTEN 중인지 |
| 시간 초과 | 방화벽, 경로 |

브라우저 화면별 의미는 다음과 같다.

| 화면 | 의미 | 조치 |
| --- | --- | --- |
| "안전하게 연결할 수 없음" | TLS 연결 자체가 실패. 흔한 원인은 HTTP 포트에 https로 접속한 것 | HTTPS 포트로 접속. TLS 1.0/1.1을 켜서 해결하지 않는다 |
| `DLG_FLAGS_INVALID_CA` | 인증서는 받았지만 발급자를 신뢰하지 않음 | 자체 서명이면 정상. 테스트 PC에만 임시 신뢰 등록 |

테스트 PC의 임시 신뢰 등록은 `server.crt`만, '현재 사용자' 범위로 한다. 등록할 때 지문을 적어 두고, 시험이 끝나면 그 지문의 인증서만 지운다.

실제 협상된 TLS 버전은 아래로 확인한다. TLS 연결이 된 것과 인증서를 신뢰하는 것은 별개다.

```powershell
& $OpenSSL s_client -connect "app.example.com:8443" -servername "app.example.com"
```

```txt
New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
```

## 레거시 클라이언트는 따로 본다

업무 화면이 IE 모드나 ActiveX 기반 클라이언트로 동작하면 클라이언트 쪽도 따로 확인한다. 클라이언트 설정이나 시작 파일에 `http://`와 기존 포트가 하드코딩돼 있을 수 있고, 클라이언트가 쓸 수 있는 TLS 버전도 서버와 별개다. 호환성 문제가 나와도 TLS 1.0/1.1을 켜서 풀지 않는다.

## HTTP에서 HTTPS로 넘어가는 순서

1. HTTPS 추가와 확인 (HTTP 유지)
2. `http://` 주소를 쓰는 연계, 링크, 바로가기 조사
3. 안내 주소를 `https://`로 변경
4. HTTP 접속 로그로 남은 사용처 확인
5. 리다이렉트 적용

처음부터 HTTP를 막으면 아무도 접속하지 못한다. 반대로 HTTPS를 붙인 뒤 HTTP를 계속 열어 두면 HTTP 사용자는 여전히 평문이다. 전환까지 해야 작업이 끝난다.

## PowerShell에서 자주 틀리는 것

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `'openssl' 용어가 ... 인식되지 않습니다` | PATH에 없음 | 전체 경로를 변수에 넣고 `& $OpenSSL` |
| `'&' 뒤에 있는 식이 잘못된 개체...` | 창을 새로 열어 변수가 비어 있음 | 변수를 다시 지정 |
| `$OpenSSL req ...`가 실행되지 않음 | 앞에 `&`가 없음 | `& $OpenSSL ...` |
| 줄 끝 백틱에서 오류 | 백틱 뒤에 공백이 있음 | 공백 제거 |

정식 인증서(PFX)를 PEM으로 나누고 개인키 권한을 정리하는 방법은 [PFX를 PEM으로 나누기와 개인키 파일 권한](/wiki/pfx-to-pem-and-private-key-permission/)에 있다.
