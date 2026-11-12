---
title: 'WebtoB(Windows)에 HTTPS 붙이기: 자체 서명 인증서로 먼저 확인한 이유'
description: 'HTTP로만 서비스하던 내부망 시스템의 WebtoB에 HTTPS를 붙였다. 정식 인증서를 기다리지 않고 자체 서명 인증서로 설정·포트·접속을 먼저 확인한 과정과, 그 순서로 한 이유를 적는다.'
date: 2026-11-13
happened: '2026년 10월'
cause: 'HTTPS가 안 될 때 설정이 틀린 건지 인증서가 틀린 건지 구분하기 어렵다. 그래서 인증서가 아닌 부분을 자체 서명 인증서로 먼저 확인해 뒀다.'
category: 'auth-security'
tags: ['WebtoB', 'HTTPS', 'TLS', 'OpenSSL', '자체 서명 인증서', 'Windows Server']
draft: false
---

> 도메인·IP·포트·경로·계정은 모두 예시 값이다. `example.com`과 `192.0.2.x`는 문서 예시용으로 예약된 값이다. WebtoB는 버전에 따라 설정 항목과 지원하는 TLS 버전이 다르니, 쓰는 버전의 매뉴얼과 대조해야 한다.

내부망 웹 시스템 하나가 HTTP로만 서비스되고 있었다. 로그인 정보와 데이터가 평문으로 오가는 상태라, 사설 인증서로 HTTPS를 적용하기로 했다. 구성은 Windows Server에 WebtoB와 WAS가 있고, 서버 2대 이중화에 앞단에 L4가 있다.

정식 인증서가 나오기 전에 자체 서명 인증서로 먼저 해 보기로 했다. 이 글은 거기까지의 기록이고, 정식 인증서로 바꾸다가 기동이 멈춘 이야기는 [2편](/posts/webtob-boot0012-encrypted-private-key/)에 적었다.

## 시작하기 전에 정한 것

- HTTPS의 목적은 접속 차단이 아니라 통신 암호화와 서버 확인이다. 누가 접속할 수 있는지는 기존처럼 네트워크, 방화벽, 로그인이 정한다.
- 기존 HTTP는 바로 끄지 않는다. HTTPS를 추가해서 확인한 뒤 마지막에 전환한다.
- 서버는 한 대씩 작업하고, 단계마다 백업과 원복 방법을 준비한다.

글에서 쓰는 예시 값은 아래와 같다.

| 항목 | 예시 값 |
| --- | --- |
| 접속 도메인 | `app.example.com` |
| 기존 HTTP 포트 / 새 HTTPS 포트 | `8080` / `8443` |
| 서버 1, 서버 2 IP | `192.0.2.11`, `192.0.2.12` |
| WebtoB 설치 경로 / 인증서 폴더 | `C:\WebtoB` / `C:\WebtoB\ssl` |
| 관리 PC 작업 폴더 | `C:\work\cert` |

## 헷갈렸던 것부터 정리

파일이 여러 개라 뭐가 뭔지부터 정리해야 했다.

| 파일 | 내용 | 공개 여부 | 두는 곳 |
| --- | --- | --- | --- |
| `server.crt` | 서버 인증서 (도메인 + 공개키 + 발급기관 서명) | 공개 | 서버 |
| `server.key` | 서버 개인키 | 비밀 | 서버 |
| `chain.pem` | 중간 CA 인증서 | 공개 | 서버 |
| 루트 CA 인증서 | 체인 맨 위의 CA 인증서 | 공개 | 사용자 PC 신뢰 저장소 |
| `server.csr` | 인증서 발급 신청서 | 공개 | CA에 제출 |
| `.pfx` / `.p12` | 인증서 + 개인키를 비밀번호로 묶은 파일 | 비밀 | 변환 후 보관·폐기 |

공개키는 따로 챙길 파일이 없다. 개인키를 만들 때 짝으로 생기고 CSR과 인증서 안에 들어간다. 그리고 확장자(.crt, .key, .pem)보다 내용이 중요하다. `-----BEGIN ...`으로 시작하는 텍스트면 PEM이다.

헷갈리기 쉬운 게 하나 있다. 개인키는 상대에게 보내는 게 아니라 서버 안에서 서명하는 데만 쓴다. 서버가 인증서와 체인을 보내고 개인키로 서명해서 진짜 주인임을 증명하면, 양쪽이 각자 계산해서 같은 세션 키를 얻고, 그 뒤 데이터는 세션 키로 암호화된다.

브라우저는 이 순서로 확인한다. 한 칸이라도 실패하면 경고가 뜬다. 그래서 서버가 정상이어도 PC 쪽 문제로 경고가 날 수 있다.

```txt
서버 인증서 → 서명 확인 → 중간 CA
중간 CA     → 서명 확인 → 루트 CA
루트 CA     → 내 PC 신뢰 목록에 있나?
+ 접속 이름이 SAN에 있나? 유효기간이 맞나?
```

## OpenSSL은 관리 PC에서

운영 서버에 새 프로그램을 설치하면 PATH나 DLL, 환경변수가 바뀌어 기존 서비스에 영향을 줄 수 있다. 인증서 파일은 어디서 만들든 결과가 같으니 관리 PC에서 만들고 결과 파일만 서버로 옮겼다. 다만 개인키를 다른 장비에서 만들어 옮겨도 되는지는 조직의 보안 정책을 먼저 확인해야 한다.

```powershell
$OpenSSL = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
Test-Path $OpenSSL        # True 여야 한다
& $OpenSSL version
```

PowerShell에서 여러 번 틀렸다. 적어 두면 누군가는 시간을 아낄 것 같다.

- `openssl`을 그냥 치면 인식하지 못한다. PATH에 없어서다. 전체 경로를 변수에 넣고 쓴다.
- 변수는 PowerShell 창을 새로 열면 사라진다. 창을 새로 열었으면 다시 지정한다.
- 실행할 때는 앞에 `&`를 붙여야 한다. `$OpenSSL req ...`만 치면 실행되지 않는다.
- 줄 끝의 백틱은 '다음 줄에 이어짐'인데, 백틱 뒤에 공백이 있으면 오류가 난다.

## 자체 서명 인증서 만들기

정식 인증서를 기다리지 않고도 WebtoB의 HTTPS 설정, 포트, WAS 연동이 되는지 먼저 볼 수 있다. 여기서 되면 나중에는 인증서 파일만 바꾸면 된다고 생각했다.

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
```

- `-x509`는 CSR 없이 자체 서명 인증서를 바로 만든다.
- `-days 30`은 유효기간이다. 테스트용이라 짧게 잡았다.
- `-nodes`는 개인키를 암호화하지 않는다는 뜻이다. OpenSSL 3.x에서는 `-noenc`가 새 이름이다.
- 인증서 이름에는 URL 전체가 아니라 도메인만 넣는다. 접속 주소가 `http://app.example.com:8080/app/`이면 `app.example.com`만 넣는다.

만든 뒤에는 SAN에 도메인이 들어갔는지, 자체 서명이라 Subject와 Issuer가 같은지 확인했다.

```powershell
& $OpenSSL x509 -in server.crt -noout -subject -issuer -dates -ext subjectAltName
```

## WebtoB에 HTTPS 추가

먼저 서버에서 쓸 포트가 비어 있는지 보고, 설정을 통째로 백업했다. 설정 원본(.m)만이 아니라 컴파일 결과와 기존 인증서 폴더도 같이 백업한다.

```powershell
# 결과가 없어야 한다
Get-NetTCPConnection -State Listen -LocalPort 8443 -ErrorAction SilentlyContinue

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
Copy-Item "C:\WebtoB\config" "C:\WebtoB\config_backup_$ts" -Recurse
```

HTTPS 포트가 꼭 443일 필요는 없다. 다른 프로그램이 안 쓰고, 방화벽이 허용하고, WebtoB가 그 포트를 SSL로 받으면 된다. 반대로 방화벽만 열었다고 HTTPS가 되지는 않는다.

인증서와 개인키를 서버의 `C:\WebtoB\ssl`로 옮겼다. 설정에 적는 경로는 서버 기준 경로다. 관리 PC에만 파일이 있으면 WebtoB는 열지 못한다. 웹 문서 경로(DOCROOT) 안에는 두지 않는다.

`http.m`에는 기존 HTTP 설정을 그대로 두고 아래를 추가했다.

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

놓치기 쉬운 게 있다. 기존 `*SVRGROUP`이나 `*URI`에 `VhostName` 제한이 걸려 있으면 HTTPS 가상호스트 이름도 추가해 줘야 업무 화면이 연결된다. `*NODE`에 `Listen`이 있으면 `Port`보다 우선한다. `Protocols` 표기법은 버전마다 다를 수 있어서 위 표기는 예시로만 봐야 한다. TLS 1.0과 1.1은 켜지 않는다.

```shell
cd /d C:\WebtoB\config
wscfl -i http.m
```

컴파일이 오류 없이 끝나야 재기동한다. 그리고 컴파일 성공, 기동 성공, 접속 성공은 전부 다른 일이다. 단계마다 따로 확인했다.

HTTPS 가상호스트에는 접속 로그를 따로 붙여 뒀다. 그 파일에 한 줄이라도 찍히면 요청이 TLS를 통과해 WebtoB까지 왔다는 뜻이라, 접속 시험할 때도 쓰고 나중에 HTTP에서 HTTPS로 넘어갈 때 아직 HTTP로 들어오는 곳을 찾는 데도 쓴다.

```txt
*LOGGING
log_https_acc
    Format   = "DEFAULT",
    FileName = "C:/WebtoB/log/access_https_%Y%%M%%D%.log",
    Option   = "sync"
```

## 접속 시험

L4를 거치지 않고 서버마다 직접 붙어 봤다.

```powershell
curl.exe -vk --noproxy "*" `
  --resolve "app.example.com:8443:192.0.2.11" `
  "https://app.example.com:8443/app/" -o NUL
```

PowerShell 5.1에서는 반드시 `curl.exe`라고 쳐야 한다. `curl`은 `Invoke-WebRequest`의 별칭이라 옵션이 먹지 않는다. `--resolve`는 도메인은 그대로 두고 연결할 IP만 바꿔 준다. `-k`는 인증서 검증을 건너뛰는 진단용이라, `-k`로 된다고 신뢰 문제가 해결된 건 아니다.

| 결과 | 다음에 볼 것 |
| --- | --- |
| 200, 302 같은 HTTP 응답 | HTTPS 연결은 됐다. 브라우저와 업무 화면 확인 |
| 404 | `VhostName`, URI 매핑 누락 |
| 503 | WAS 연결 상태 |
| handshake / SSL 오류 | WebtoB SSL 설정, 인증서, 로그 |
| Connection refused | 해당 포트가 LISTEN 중인지 |
| 시간 초과 | 방화벽, 경로 |

브라우저에서 "안전하게 연결할 수 없음"이 떴는데, HTTP 포트(8080)에 https로 접속한 것이었다. 이런 경우 TLS 1.0이나 1.1을 켜서 해결하려고 하면 안 된다. 포트부터 본다.

자체 서명이라 브라우저 경고(`DLG_FLAGS_INVALID_CA`)가 뜨는 건 정상이다. 테스트 PC 한 대에만 임시로 신뢰 등록을 해서 경고 없이 접속되는 것까지 확인했다. 등록하는 건 `server.crt`뿐이고, '로컬 컴퓨터'가 아니라 '현재 사용자'로 넣어서 영향 범위를 줄였다. 등록할 때 지문을 적어 뒀다가 시험이 끝나면 그 지문의 인증서만 지운다.

마지막으로 실제 협상된 TLS 버전도 확인했다.

```powershell
& $OpenSSL s_client -connect "app.example.com:8443" -servername "app.example.com"
```

```txt
New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
```

TLS 연결이 된 것과 인증서를 신뢰하는 것은 별개다. OpenSSL은 Windows 인증서 저장소와 다른 신뢰 기준을 쓸 수 있다.

## 서버만 되면 끝이 아니었다

업무 화면이 IE 모드나 ActiveX 기반 클라이언트로 동작한다면 클라이언트 쪽도 따로 봐야 한다. 클라이언트 설정이나 시작 파일에 `http://`와 기존 포트가 하드코딩돼 있을 수 있고, 클라이언트가 쓸 수 있는 TLS 버전도 서버와 별개다. 여기서 호환성 문제가 나와도 TLS 1.0이나 1.1을 켜서 풀지는 않는다.

그리고 HTTPS를 붙여도 HTTP를 계속 열어 두면 HTTP로 들어오는 사용자는 여전히 평문이다. 그렇다고 처음부터 HTTP를 막으면 아무도 접속하지 못한다. 그래서 순서는 HTTPS 추가와 확인, `http://` 주소를 쓰는 연계와 바로가기 조사, 안내 주소 변경, HTTP 로그로 남은 사용처 확인, 리다이렉트다. 전환까지 해야 작업이 끝난다.

## 남기는 것

인증서 문제는 '서버가 무엇을 보내는가'와 '클라이언트가 그것을 믿는가'를 나눠서 봐야 했다.

자체 서명 인증서로 먼저 해 본 건 잘한 선택이었다. 설정과 포트, 접속 경로를 인증서와 분리해서 확인해 둔 덕분에, 2편에서 문제가 생겼을 때 볼 범위가 좁았다.
